import type { MCPConfig } from './types';

export const MCP_CONFIG: MCPConfig = {
  transport: {
    command: '/usr/lib/jvm/temurin-17-jdk-amd64/bin/java',
    args: [
      '-Dspring.ai.mcp.server.transport=STDIO',
      '-Dfile.encoding=UTF-8',
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