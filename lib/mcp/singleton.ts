import { experimental_createMCPClient } from 'ai';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { MCPConnectionManager } from './connection-manager';
import { MCPLifecycleManager } from './lifecycle';
import { MCPLogger } from './logger';
import { MCP_CONFIG } from './config';
import type { MCPClientInstance, ConnectionStatus } from './types';

export class MCPSingleton {
  private static instance: MCPSingleton | null = null;
  private clientInstance: MCPClientInstance | null = null;
  private connectionManager: MCPConnectionManager;
  private isInitializing: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.connectionManager = new MCPConnectionManager(this);
    MCPLifecycleManager.setupProcessHandlers();
    MCPLifecycleManager.registerCleanupHandler(() => this.cleanup());
    MCPLogger.info('MCPSingleton constructor chiamato');
  }

  static getInstance(): MCPSingleton {
    if (!MCPSingleton.instance) {
      MCPSingleton.instance = new MCPSingleton();
      MCPLogger.info('Nuova istanza MCPSingleton creata');
    }
    return MCPSingleton.instance;
  }

  async getClient(): Promise<any> {
    await this.ensureInitialized();
    return this.clientInstance?.client;
  }

  async getTools(): Promise<any> {
    await this.ensureInitialized();
    return this.clientInstance?.tools;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.clientInstance?.isConnected) {
      return; // Già inizializzato e connesso
    }

    if (this.isInitializing && this.initializationPromise) {
      // Attendi che l'inizializzazione in corso finisca
      await this.initializationPromise;
      return;
    }

    this.initializationPromise = this.initialize();
    await this.initializationPromise;
  }

  private async initialize(): Promise<void> {
    if (this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    
    try {
      MCPLogger.info('Inizializzazione MCP Singleton...');
      
      // Cleanup istanza precedente se esiste
      if (this.clientInstance) {
        await this.cleanupInstance();
      }

      // Crea nuovo transport (usando la stessa configurazione del route.ts originale)
      const transport = new StdioClientTransport({
        command: MCP_CONFIG.transport.command,
        args: MCP_CONFIG.transport.args,
        timeout: MCP_CONFIG.transport.timeout,
        keepAlive: MCP_CONFIG.transport.keepAlive,
        onStderr: (chunk: any) => {
          MCPLogger.error('MCP Server STDERR', chunk.toString());
        },
      } as any);

      MCPLogger.debug('Transport MCP creato');

      // Crea client MCP
      const client = await experimental_createMCPClient({ transport });
      MCPLogger.info('Client MCP creato con successo');

      // Recupera tools
      const tools = await client.tools();
      MCPLogger.info('Tools MCP recuperati', { toolCount: Object.keys(tools).length });

      // Crea istanza
      this.clientInstance = {
        client,
        tools,
        transport,
        isConnected: true,
        lastHealthCheck: new Date(),
        connectionAttempts: 0
      };

      // Avvia health check
      this.connectionManager.startHealthCheck();
      
      MCPLogger.info('MCP Singleton inizializzato con successo');
      
    } catch (error) {
      MCPLogger.error('Errore inizializzazione MCP Singleton', error);
      this.clientInstance = null;
      throw error;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.clientInstance) {
      MCPLogger.debug('Health check: nessuna istanza client');
      return false;
    }

    try {
      // Verifica che il client sia ancora attivo tentando di recuperare i tools
      const tools = await this.clientInstance.client.tools();
      this.clientInstance.lastHealthCheck = new Date();
      this.clientInstance.isConnected = true;
      MCPLogger.debug('Health check: OK', { toolCount: Object.keys(tools).length });
      return true;
    } catch (error) {
      MCPLogger.warn('Health check fallito', error);
      this.clientInstance.isConnected = false;
      this.clientInstance.connectionAttempts++;
      return false;
    }
  }

  async reconnect(): Promise<void> {
    MCPLogger.info('Tentativo di riconnessione MCP...');
    
    if (this.clientInstance) {
      this.clientInstance.connectionAttempts++;
    }
    
    // Forza reinizializzazione
    this.clientInstance = null;
    this.isInitializing = false;
    this.initializationPromise = null;
    
    await this.initialize();
  }

  getConnectionStatus(): ConnectionStatus {
    if (!this.clientInstance) {
      return {
        isConnected: false,
        lastHealthCheck: null,
        connectionAttempts: 0,
        uptime: 0
      };
    }

    const uptime = this.clientInstance.lastHealthCheck 
      ? Date.now() - this.clientInstance.lastHealthCheck.getTime()
      : 0;

    return {
      isConnected: this.clientInstance.isConnected,
      lastHealthCheck: this.clientInstance.lastHealthCheck,
      connectionAttempts: this.clientInstance.connectionAttempts,
      uptime
    };
  }

  private async cleanupInstance(): Promise<void> {
    if (!this.clientInstance) return;

    try {
      // Chiudi il transport se ha un metodo close
      if (this.clientInstance.transport && typeof this.clientInstance.transport.close === 'function') {
        await this.clientInstance.transport.close();
        MCPLogger.debug('Transport chiuso');
      }
    } catch (error) {
      MCPLogger.error('Errore durante cleanup transport', error);
    }
  }

  async cleanup(): Promise<void> {
    MCPLogger.info('Cleanup MCP Singleton...');
    
    this.connectionManager.stopHealthCheck();
    await this.cleanupInstance();
    this.clientInstance = null;
    this.isInitializing = false;
    this.initializationPromise = null;
    
    MCPLogger.info('Cleanup MCP completato');
  }

  // Metodo per debugging
  getDebugInfo(): any {
    return {
      hasInstance: !!this.clientInstance,
      isInitializing: this.isInitializing,
      connectionStatus: this.getConnectionStatus(),
      healthCheckStatus: this.connectionManager.getHealthCheckStatus()
    };
  }
}