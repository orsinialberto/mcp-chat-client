import { MCPLogger } from './logger';
import { MCP_CONFIG } from './config';
import type { ConnectionStatus } from './types';

export class MCPConnectionManager {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private singleton: any; // Riferimento al singleton, tipizzato come any per evitare dipendenze circolari

  constructor(singleton: any) {
    this.singleton = singleton;
  }

  startHealthCheck(): void {
    if (this.healthCheckInterval) {
      this.stopHealthCheck();
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        const isHealthy = await this.singleton.healthCheck();
        
        if (!isHealthy) {
          MCPLogger.warn('Health check fallito, tentativo di riconnessione...');
          await this.attemptReconnection();
        } else {
          MCPLogger.debug('Health check OK');
        }
      } catch (error) {
        MCPLogger.error('Errore durante health check', error);
        await this.attemptReconnection();
      }
    }, MCP_CONFIG.connection.healthCheckInterval);

    MCPLogger.debug('Health check avviato', { 
      interval: MCP_CONFIG.connection.healthCheckInterval 
    });
  }

  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      MCPLogger.debug('Health check fermato');
    }
  }

  async attemptReconnection(): Promise<boolean> {
    const status = this.singleton.getConnectionStatus();
    
    if (status.connectionAttempts >= MCP_CONFIG.connection.maxReconnectAttempts) {
      MCPLogger.error('Massimo numero di tentativi di riconnessione raggiunto', {
        attempts: status.connectionAttempts,
        maxAttempts: MCP_CONFIG.connection.maxReconnectAttempts
      });
      return false;
    }

    try {
      MCPLogger.info('Tentativo di riconnessione...', { 
        attempt: status.connectionAttempts + 1,
        maxAttempts: MCP_CONFIG.connection.maxReconnectAttempts
      });

      // Attendi prima di riconnettere
      await new Promise(resolve => 
        setTimeout(resolve, MCP_CONFIG.connection.reconnectDelay)
      );
      
      await this.singleton.reconnect();
      MCPLogger.info('Riconnessione MCP riuscita');
      return true;
    } catch (error) {
      MCPLogger.error('Riconnessione MCP fallita', error);
      return false;
    }
  }

  getHealthCheckStatus(): { isActive: boolean; interval: number } {
    return {
      isActive: this.healthCheckInterval !== null,
      interval: MCP_CONFIG.connection.healthCheckInterval
    };
  }
}