/**
 * Error Handler Service
 * Centralized error handling with context and recovery
 * Follows Single Responsibility Principle
 */

import type { IErrorHandler, ErrorContext, ErrorHandlerFn } from '@app-types';
import type { ILogger } from '@app-types';

export class ErrorHandler implements IErrorHandler {
  private static instance: ErrorHandler;
  private handlers: ErrorHandlerFn[] = [];
  private logger: ILogger;

  private constructor(logger: ILogger) {
    this.logger = logger;
  }

  static getInstance(logger: ILogger): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(logger);
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with optional context
   */
  handle(error: Error, context?: ErrorContext): void {
    try {
      // Log the error
      const contextStr = context
        ? ` | Feature: ${context.feature || 'unknown'} | Action: ${context.action || 'unknown'}`
        : '';

      this.logger.error(
        `Error occurred${contextStr}: ${error.message}`,
        error,
        context?.metadata
      );

      // Call registered handlers
      this.handlers.forEach((handler) => {
        try {
          handler(error, context);
        } catch (handlerError) {
          this.logger.error(
            'Error in error handler',
            handlerError as Error
          );
        }
      });
    } catch (fatalError) {
      // Fallback if logging fails
      console.error('[InstaBits] Fatal error in error handler:', fatalError);
      console.error('[InstaBits] Original error:', error);
    }
  }

  /**
   * Register a custom error handler
   */
  register(handler: ErrorHandlerFn): void {
    this.handlers.push(handler);
  }

  /**
   * Set up global error handlers
   */
  setGlobalHandler(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handle(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        { action: 'unhandledRejection', metadata: { reason: event.reason } }
      );
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handle(event.error || new Error(event.message), {
        action: 'globalError',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });
  }

  /**
   * Wrap an async function with error handling
   */
  static wrap<T>(
    fn: () => Promise<T>,
    context?: ErrorContext
  ): () => Promise<T | null> {
    return async () => {
      try {
        return await fn();
      } catch (error) {
        ErrorHandler.instance?.handle(error as Error, context);
        return null;
      }
    };
  }

  /**
   * Wrap a sync function with error handling
   */
  static wrapSync<T>(
    fn: () => T,
    context?: ErrorContext
  ): () => T | null {
    return () => {
      try {
        return fn();
      } catch (error) {
        ErrorHandler.instance?.handle(error as Error, context);
        return null;
      }
    };
  }
}
