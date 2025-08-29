# Architettura MCP Singleton - Soluzione per Gestione Persistente delle Connessioni

## Problema Identificato

Le variabili globali `mcpClientInstance` e `mcpToolsInstance` nel file [`app/api/chat/route.ts`](app/api/chat/route.ts:29-30) si perdono ad ogni refresh della pagina a causa del Hot Module Replacement (HMR) di Next.js, causando:

- ✗ Perdita delle istanze MCP ad ogni ricaricamento
- ✗ Creazione di server MCP multipli in conflitto
- ✗ Mancanza di cleanup delle connessioni precedenti
- ✗ Nessun error handling per riconnessioni
- ✗ Nessun monitoring dello stato delle connessioni

## Soluzione: Singleton Pattern con Gestione del Ciclo di Vita

### Architettura Proposta

```mermaid
graph TD
    A[API Route Handler] --> B[MCPSingleton.getInstance()]
    B --> C{Istanza Esistente?}
    C -->|Sì| D[Verifica Connessione]
    C -->|No| E[Crea Nuova Istanza]
    D -->|Attiva| F[Restituisci Client e Tools]
    D -->|Inattiva| G[Riconnetti]
    E --> H[Inizializza Transport]
    H --> I[Crea Client MCP]
    I --> J[Recupera Tools]
    J --> K[Registra Cleanup Handlers]
    K --> F
    G --> F
    F --> L[Esegui Operazione Chat]
    
    M[Process Exit Handler] --> N[Cleanup Connessioni]
    O[Error Handler] --> P[Riconnessione Automatica]
    Q[Health Check Timer] --> R[Verifica Stato Connessione]
```

### Componenti dell'Architettura

#### 1. MCPSingleton (`lib/mcp/singleton.ts`)
```typescript
class MCPSingleton {
  private static instance: MCPSingleton | null = null;
  private mcpClient: any = null;
  private mcpTools: any = null;
  private transport: StdioClientTransport | null = null;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private lastHealthCheck: Date | null = null;
  
  static getInstance(): MCPSingleton
  async getClient(): Promise<any>
  async getTools(): Promise<any>
  async reconnect(): Promise<void>
  async healthCheck(): Promise<boolean>
  async cleanup(): Promise<void>
}
```

#### 2. Connection Manager (`lib/mcp/connection-manager.ts`)
```typescript
class MCPConnectionManager {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts: number = 3;
  private reconnectDelay: number = 1000;
  
  startHealthCheck(): void
  stopHealthCheck(): void
  async attemptReconnection(): Promise<boolean>
  getConnectionStatus(): ConnectionStatus
}
```

#### 3. Lifecycle Manager (`lib/mcp/lifecycle.ts`)
```typescript
class MCPLifecycleManager {
  static setupProcessHandlers(): void
  static registerCleanupHandler(handler: () => Promise<void>): void
  static async gracefulShutdown(): Promise<void>
}
```

#### 4. Logger (`lib/mcp/logger.ts`)
```typescript
class MCPLogger {
  static info(message: string, data?: any): void
  static error(message: string, error?: Error): void
  static warn(message: string, data?: any): void
  static debug(message: string, data?: any): void
}
```

### Struttura dei File

```
lib/
├── mcp/
│   ├── types.ts              # Tipi TypeScript
│   ├── singleton.ts          # Singleton manager principale
│   ├── connection-manager.ts # Gestione connessioni e health check
│   ├── lifecycle.ts          # Gestione ciclo di vita e cleanup
│   ├── logger.ts            # Sistema di logging dedicato
│   └── config.ts            # Configurazione MCP
```

### Configurazione MCP (`lib/mcp/config.ts`)

```typescript
export const MCP_CONFIG = {
  transport: {
    command: '/usr/lib/jvm/temurin-17-jdk-amd64/bin/java',
    args: [
      '-Dspring.ai.mcp.server.transport=STDIO',
      '-jar',
      '/home/alberto_orsini_linux/dev/albe/plan-segment-assistant/plan-segment-assistant/target/plan-segment-assistant-0.0.1-SNAPSHOT.jar'
    ],
    timeout: 30000,
    keepAlive: true
  },
  connection: {
    maxReconnectAttempts: 3,
    reconnectDelay: 1000,
    healthCheckInterval: 30000,
    connectionTimeout: 10000
  },
  logging: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    prefix: '[MCP]'
  }
};
```

## Implementazione Dettagliata

### 1. Tipi TypeScript (`lib/mcp/types.ts`)

```typescript
export interface MCPClientInstance {
  client: any;
  tools: any;
  transport: any;
  isConnected: boolean;
  lastHealthCheck: Date | null;
  connectionAttempts: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastHealthCheck: Date | null;
  connectionAttempts: number;
  uptime: number;
  error?: string;
}

export interface MCPConfig {
  transport: {
    command: string;
    args: string[];
    timeout: number;
    keepAlive: boolean;
  };
  connection: {
    maxReconnectAttempts: number;
    reconnectDelay: number;
    healthCheckInterval: number;
    connectionTimeout: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    prefix: string;
  };
}
```

### 2. Singleton Manager (`lib/mcp/singleton.ts`)

```typescript
import { experimental_createMCPClient } from 'ai';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';
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

  private constructor() {
    this.connectionManager = new MCPConnectionManager(this);
    MCPLifecycleManager.setupProcessHandlers();
    MCPLifecycleManager.registerCleanupHandler(() => this.cleanup());
  }

  static getInstance(): MCPSingleton {
    if (!MCPSingleton.instance) {
      MCPSingleton.instance = new MCPSingleton();
    }
    return MCPSingleton.instance;
  }

  async getClient(): Promise<any> {
    if (!this.clientInstance || !this.clientInstance.isConnected) {
      await this.initialize();
    }
    return this.clientInstance?.client;
  }

  async getTools(): Promise<any> {
    if (!this.clientInstance || !this.clientInstance.isConnected) {
      await this.initialize();
    }
    return this.clientInstance?.tools;
  }

  private async initialize(): Promise<void> {
    if (this.isInitializing) {
      // Attendi che l'inizializzazione in corso finisca
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;
    
    try {
      MCPLogger.info('Inizializzazione MCP Singleton...');
      
      // Cleanup istanza precedente se esiste
      if (this.clientInstance) {
        await this.cleanup();
      }

      // Crea nuovo transport
      const transport = new StdioClientTransport({
        command: MCP_CONFIG.transport.command,
        args: MCP_CONFIG.transport.args,
        timeout: MCP_CONFIG.transport.timeout,
        keepAlive: MCP_CONFIG.transport.keepAlive,
        onStderr: (chunk) => {
          MCPLogger.error('MCP Server STDERR', chunk.toString());
        },
      });

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
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.clientInstance) return false;

    try {
      // Verifica che il client sia ancora attivo
      const tools = await this.clientInstance.client.tools();
      this.clientInstance.lastHealthCheck = new Date();
      this.clientInstance.isConnected = true;
      return true;
    } catch (error) {
      MCPLogger.warn('Health check fallito', error);
      this.clientInstance.isConnected = false;
      return false;
    }
  }

  async reconnect(): Promise<void> {
    MCPLogger.info('Tentativo di riconnessione MCP...');
    this.clientInstance = null;
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

  async cleanup(): Promise<void> {
    MCPLogger.info('Cleanup MCP Singleton...');
    
    this.connectionManager.stopHealthCheck();
    
    if (this.clientInstance?.transport) {
      try {
        // Chiudi il transport se ha un metodo close
        if (typeof this.clientInstance.transport.close === 'function') {
          await this.clientInstance.transport.close();
        }
      } catch (error) {
        MCPLogger.error('Errore durante cleanup transport', error);
      }
    }
    
    this.clientInstance = null;
    MCPLogger.info('Cleanup MCP completato');
  }
}
```

### 3. Connection Manager (`lib/mcp/connection-manager.ts`)

```typescript
import { MCPSingleton } from './singleton';
import { MCPLogger } from './logger';
import { MCP_CONFIG } from './config';

export class MCPConnectionManager {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private singleton: MCPSingleton;

  constructor(singleton: MCPSingleton) {
    this.singleton = singleton;
  }

  startHealthCheck(): void {
    if (this.healthCheckInterval) {
      this.stopHealthCheck();
    }

    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.singleton.healthCheck();
      
      if (!isHealthy) {
        MCPLogger.warn('Health check fallito, tentativo di riconnessione...');
        await this.attemptReconnection();
      }
    }, MCP_CONFIG.connection.healthCheckInterval);

    MCPLogger.debug('Health check avviato');
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
      MCPLogger.error('Massimo numero di tentativi di riconnessione raggiunto');
      return false;
    }

    try {
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
}
```

### 4. Lifecycle Manager (`lib/mcp/lifecycle.ts`)

```typescript
import { MCPLogger } from './logger';

export class MCPLifecycleManager {
  private static cleanupHandlers: Array<() => Promise<void>> = [];
  private static isShuttingDown: boolean = false;

  static setupProcessHandlers(): void {
    // Gestione graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('uncaughtException', (error) => {
      MCPLogger.error('Uncaught Exception', error);
      this.gracefulShutdown();
    });
    process.on('unhandledRejection', (reason, promise) => {
      MCPLogger.error('Unhandled Rejection', { reason, promise });
    });

    MCPLogger.debug('Process handlers registrati');
  }

  static registerCleanupHandler(handler: () => Promise<void>): void {
    this.cleanupHandlers.push(handler);
  }

  static async gracefulShutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    MCPLogger.info('Avvio graceful shutdown...');

    try {
      await Promise.all(
        this.cleanupHandlers.map(handler => handler())
      );
      MCPLogger.info('Graceful shutdown completato');
    } catch (error) {
      MCPLogger.error('Errore durante graceful shutdown', error);
    }

    process.exit(0);
  }
}
```

### 5. Logger (`lib/mcp/logger.ts`)

```typescript
import { MCP_CONFIG } from './config';

export class MCPLogger {
  private static shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(MCP_CONFIG.logging.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private static formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = MCP_CONFIG.logging.prefix;
    let formatted = `${timestamp} ${prefix} [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      formatted += ` ${JSON.stringify(data)}`;
    }
    
    return formatted;
  }

  static debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  static info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  static warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  static error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      const errorData = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : error;
      console.error(this.formatMessage('error', message, errorData));
    }
  }
}
```

## Refactoring del Route Handler

### Prima (Problematico)
```typescript
// Variabili globali volatili
let mcpClientInstance: any = null;
let mcpToolsInstance: any = null;

export async function POST(req: Request) {
  // Logica di inizializzazione ripetuta
  if (!mcpClientInstance) {
    mcpClientInstance = await experimental_createMCPClient({transport})
  }
  if (!mcpToolsInstance) {
    mcpToolsInstance = await mcpClientInstance.tools()
  }
  // ...resto del codice
}
```

### Dopo (Soluzione Singleton)
```typescript
import { MCPSingleton } from '@/lib/mcp/singleton';

export async function POST(req: Request) {
  try {
    // Ottieni istanza singleton
    const mcpSingleton = MCPSingleton.getInstance();
    
    // Ottieni client e tools (con gestione automatica della connessione)
    const tools = await mcpSingleton.getTools();
    
    // Resto della logica rimane invariata
    const response = streamText({
      model,
      tools,
      messages: allMessages,
      // ...
    });
    
    return response.toDataStreamResponse();
  } catch (error) {
    // Error handling migliorato
    MCPLogger.error('Errore nella chat', error);
    // ...
  }
}
```

## Vantaggi della Soluzione

### ✅ Persistenza
- Le istanze MCP sopravvivono ai refresh del modulo
- Singleton pattern garantisce una sola istanza per processo
- Gestione automatica del ciclo di vita

### ✅ Resilienza
- Health check automatici ogni 30 secondi
- Riconnessione automatica in caso di errori
- Graceful shutdown con cleanup delle risorse

### ✅ Monitoring
- Logging strutturato con livelli configurabili
- Metriche di connessione (uptime, tentativi, stato)
- Visibilità completa sullo stato del sistema

### ✅ Performance
- Riutilizzo delle connessioni esistenti
- Inizializzazione lazy solo quando necessario
- Evita creazione di server MCP multipli

### ✅ Manutenibilità
- Codice modulare e ben strutturato
- Configurazione centralizzata
- Facile testing e debugging

## Piano di Implementazione

1. **Creare i file base** (`types.ts`, `config.ts`, `logger.ts`)
2. **Implementare il singleton** (`singleton.ts`)
3. **Aggiungere connection manager** (`connection-manager.ts`)
4. **Implementare lifecycle manager** (`lifecycle.ts`)
5. **Refactoring del route handler** (`app/api/chat/route.ts`)
6. **Testing e validazione**

## Testing della Soluzione

### Test di Persistenza
1. Avviare l'applicazione
2. Fare una richiesta chat
3. Refreshare la pagina
4. Fare un'altra richiesta chat
5. Verificare che non vengano creati server MCP multipli

### Test di Resilienza
1. Simulare errore di connessione MCP
2. Verificare riconnessione automatica
3. Testare graceful shutdown
4. Verificare cleanup delle risorse

### Metriche da Monitorare
- Numero di istanze MCP attive
- Tempo di uptime delle connessioni
- Numero di riconnessioni automatiche
- Tempo di risposta delle operazioni MCP

Questa architettura risolve completamente il problema delle variabili globali volatili e fornisce una base solida per la gestione delle connessioni MCP in produzione.