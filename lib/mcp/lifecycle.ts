import { MCPLogger } from './logger';

export class MCPLifecycleManager {
  private static cleanupHandlers: Array<() => Promise<void>> = [];
  private static isShuttingDown: boolean = false;
  private static handlersRegistered: boolean = false;

  static setupProcessHandlers(): void {
    if (this.handlersRegistered) {
      return; // Evita registrazione multipla
    }

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

    this.handlersRegistered = true;
    MCPLogger.debug('Process handlers registrati');
  }

  static registerCleanupHandler(handler: () => Promise<void>): void {
    this.cleanupHandlers.push(handler);
    MCPLogger.debug('Cleanup handler registrato', { totalHandlers: this.cleanupHandlers.length });
  }

  static async gracefulShutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    MCPLogger.info('Avvio graceful shutdown...');

    try {
      // Esegui tutti i cleanup handlers con timeout
      const cleanupPromises = this.cleanupHandlers.map(handler => 
        Promise.race([
          handler(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Cleanup timeout')), 5000)
          )
        ])
      );

      await Promise.allSettled(cleanupPromises);
      MCPLogger.info('Graceful shutdown completato');
    } catch (error) {
      MCPLogger.error('Errore durante graceful shutdown', error);
    }

    // In ambiente di sviluppo, non fare exit per permettere HMR
    if (process.env.NODE_ENV !== 'development') {
      process.exit(0);
    }
  }

  static reset(): void {
    // Metodo per reset durante i test o HMR
    this.cleanupHandlers = [];
    this.isShuttingDown = false;
  }
}