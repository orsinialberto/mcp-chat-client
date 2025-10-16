export async function register() {
  // Only run on server-side in Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { MCPSingleton, MCPLogger } = await import('./lib/mcp');
    
    const mcpSingleton = MCPSingleton.getInstance();
    
    // Check if already initialized (prevents re-initialization during HMR)
    if (mcpSingleton.isReady()) {
      MCPLogger.info('✅ MCP already initialized, skipping (HMR detected)');
      return;
    }
    
    MCPLogger.info('🚀 Starting eager MCP initialization...');
    
    try {
      // Pre-initialize the MCP connection
      await mcpSingleton.getTools();
      
      MCPLogger.info('✅ MCP initialized successfully on server startup');
      
      // Log connection status
      const status = mcpSingleton.getConnectionStatus();
      MCPLogger.info('📊 MCP Status:', {
        isConnected: status.isConnected,
        uptime: status.uptime,
        attempts: status.connectionAttempts
      });
      
    } catch (error) {
      // Don't crash the server if MCP fails - graceful degradation
      MCPLogger.error('⚠️ MCP initialization failed on startup', error);
      MCPLogger.warn('Server will continue without MCP tools. They will be retried on first request.');
    }
  }
}

