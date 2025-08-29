/**
 * MCP Singleton System - Entry Point
 * 
 * Sistema di gestione singleton per connessioni MCP con:
 * - Persistenza delle istanze durante HMR
 * - Health check automatici
 * - Riconnessione automatica
 * - Cleanup delle risorse
 * - Logging strutturato
 */

export { MCPSingleton } from './singleton';
export { MCPConnectionManager } from './connection-manager';
export { MCPLifecycleManager } from './lifecycle';
export { MCPLogger } from './logger';
export { MCP_CONFIG } from './config';
export type { 
  MCPClientInstance, 
  ConnectionStatus, 
  MCPConfig, 
  MCPTransportConfig 
} from './types';