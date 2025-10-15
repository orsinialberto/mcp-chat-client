/**
 * Client-safe logger that can be used in both client and server components
 * This is a simplified version that doesn't depend on MCP singleton
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class ClientLogger {
  private prefix: string = '[MCP-Client]'

  private shouldLog(level: LogLevel): boolean {
    if (typeof window === 'undefined') {
      return process.env.NODE_ENV === 'development'
    }
    return true
  }

  private formatMessage(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString()
    const formattedMessage = `${timestamp} ${this.prefix} [${level.toUpperCase()}] ${message}`
    
    if (args.length > 0) {
      console[level as keyof Console](formattedMessage, ...args)
    } else {
      console[level as keyof Console](formattedMessage)
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      this.formatMessage('debug', message, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      this.formatMessage('info', message, ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      this.formatMessage('warn', message, ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      this.formatMessage('error', message, ...args)
    }
  }
}

export const Logger = new ClientLogger()

