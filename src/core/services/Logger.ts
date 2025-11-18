/**
 * Centralized logging service for InstaBits
 * Provides consistent logging with levels and prefixes
 */

import type { LogLevel } from '@/types/global';

class Logger {
  private static instance: Logger;
  private prefix: string = '[InstaBits]';
  private enabledLevels: Set<LogLevel> = new Set(['info', 'warn', 'error']);

  private constructor() {
    // Enable debug in development - check if in dev mode
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'development') {
        this.enabledLevels.add('debug');
      }
    } catch {
      // Ignore errors in checking mode
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.has(level);
  }

  private formatMessage(level: LogLevel, context: string, message: string): string {
    return `${this.prefix}[${level.toUpperCase()}][${context}] ${message}`;
  }

  public debug(context: string, message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', context, message), ...args);
    }
  }

  public info(context: string, message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', context, message), ...args);
    }
  }

  public warn(context: string, message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', context, message), ...args);
    }
  }

  public error(context: string, message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', context, message);
      if (error) {
        console.error(formatted, error);
      } else {
        console.error(formatted);
      }
    }
  }

  public group(label: string): void {
    if (this.shouldLog('debug')) {
      console.group(`${this.prefix} ${label}`);
    }
  }

  public groupEnd(): void {
    if (this.shouldLog('debug')) {
      console.groupEnd();
    }
  }

  public enableLevel(level: LogLevel): void {
    this.enabledLevels.add(level);
  }

  public disableLevel(level: LogLevel): void {
    this.enabledLevels.delete(level);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
