/**
 * Logger Service
 * Provides structured logging with configurable levels
 * Singleton pattern - Single Responsibility Principle
 */

import type { ILogger } from '@app-types';
import { LogLevel } from '@app-types';

export class Logger implements ILogger {
  private static instance: Logger;
  private currentLevel: LogLevel;
  private prefix: string;

  private readonly logLevels: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };

  private constructor(prefix = '[InstaBits]') {
    this.prefix = prefix;
    this.currentLevel = LogLevel.INFO;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    const errorData = error
      ? { message: error.message, stack: error.stack }
      : undefined;
    this.log(LogLevel.ERROR, message, [...args, errorData]);
  }

  private log(level: LogLevel, message: string, args: unknown[]): void {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const formattedMessage = `${this.prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`;

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, ...args);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, ...args);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, ...args);
          break;
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.currentLevel];
  }
}
