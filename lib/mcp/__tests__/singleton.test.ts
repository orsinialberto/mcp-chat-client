import { MCPSingleton } from '../singleton'

jest.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: jest.fn()
}))

jest.mock('ai', () => ({
  experimental_createMCPClient: jest.fn()
}))

describe('MCPSingleton', () => {
  let instance: MCPSingleton

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = MCPSingleton.getInstance()
      const instance2 = MCPSingleton.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    it('should create only one instance', () => {
      const instance1 = MCPSingleton.getInstance()
      const instance2 = MCPSingleton.getInstance()
      const instance3 = MCPSingleton.getInstance()
      
      expect(instance1).toBe(instance2)
      expect(instance2).toBe(instance3)
    })
  })

  describe('getConnectionStatus', () => {
    it('should return disconnected status when not initialized', () => {
      const instance = MCPSingleton.getInstance()
      const status = instance.getConnectionStatus()
      
      expect(status.isConnected).toBe(false)
      expect(status.lastHealthCheck).toBeNull()
      expect(status.connectionAttempts).toBe(0)
    })

    it('should return connection status with uptime', () => {
      const instance = MCPSingleton.getInstance()
      const status = instance.getConnectionStatus()
      
      expect(status).toHaveProperty('isConnected')
      expect(status).toHaveProperty('lastHealthCheck')
      expect(status).toHaveProperty('connectionAttempts')
      expect(status).toHaveProperty('uptime')
    })
  })

  describe('getDebugInfo', () => {
    it('should return debug information', () => {
      const instance = MCPSingleton.getInstance()
      const debugInfo = instance.getDebugInfo()
      
      expect(debugInfo).toHaveProperty('hasInstance')
      expect(debugInfo).toHaveProperty('isInitializing')
      expect(debugInfo).toHaveProperty('connectionStatus')
      expect(debugInfo).toHaveProperty('healthCheckStatus')
    })

    it('should show not initializing state initially', () => {
      const instance = MCPSingleton.getInstance()
      const debugInfo = instance.getDebugInfo()
      
      expect(debugInfo.isInitializing).toBe(false)
    })
  })
})

