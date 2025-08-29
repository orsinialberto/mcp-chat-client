import { MCPSingleton, MCPLogger } from '@/lib/mcp';

export async function GET() {
  try {
    MCPLogger.info('Richiesta stato MCP ricevuta');
    
    const mcpSingleton = MCPSingleton.getInstance();
    const debugInfo = mcpSingleton.getDebugInfo();
    const connectionStatus = mcpSingleton.getConnectionStatus();
    
    // Tenta di ottenere informazioni sui tools se possibile
    let toolsInfo = null;
    try {
      const tools = await mcpSingleton.getTools();
      toolsInfo = {
        available: true,
        count: Object.keys(tools).length,
        names: Object.keys(tools)
      };
    } catch (error) {
      toolsInfo = {
        available: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      singleton: {
        initialized: debugInfo.hasInstance,
        initializing: debugInfo.isInitializing,
        healthCheckActive: debugInfo.healthCheckStatus.isActive,
        healthCheckInterval: debugInfo.healthCheckStatus.interval
      },
      connection: {
        isConnected: connectionStatus.isConnected,
        lastHealthCheck: connectionStatus.lastHealthCheck,
        connectionAttempts: connectionStatus.connectionAttempts,
        uptime: connectionStatus.uptime,
        uptimeFormatted: connectionStatus.uptime > 0 
          ? `${Math.floor(connectionStatus.uptime / 1000)}s` 
          : 'N/A'
      },
      tools: toolsInfo,
      system: {
        nodeEnv: process.env.NODE_ENV,
        processUptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage()
      }
    };
    
    MCPLogger.info('Stato MCP restituito', { 
      connected: connectionStatus.isConnected,
      toolsAvailable: toolsInfo?.available 
    });
    
    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    MCPLogger.error('Errore recupero stato MCP', error);
    
    return new Response(JSON.stringify({
      error: 'Errore interno durante recupero stato',
      details: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST() {
  try {
    MCPLogger.info('Richiesta reset connessione MCP ricevuta');
    
    const mcpSingleton = MCPSingleton.getInstance();
    await mcpSingleton.reconnect();
    
    const connectionStatus = mcpSingleton.getConnectionStatus();
    
    MCPLogger.info('Reset connessione MCP completato', connectionStatus);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Connessione MCP resettata con successo',
      connectionStatus,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    MCPLogger.error('Errore reset connessione MCP', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Errore durante reset connessione',
      details: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}