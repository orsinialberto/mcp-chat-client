/**
 * Tipi per il sistema MCP Singleton
 */

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

export interface MCPTransportConfig {
  command: string;
  args: string[];
  timeout: number;
  keepAlive: boolean;
  onStderr?: (chunk: Buffer) => void;
}