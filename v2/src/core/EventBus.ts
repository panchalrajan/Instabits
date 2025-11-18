/**
 * Event Bus
 * In-process event-driven communication
 * Decouples features from each other (Dependency Inversion)
 */

import type { IEventBus, EventHandler } from '@app-types';
import type { ILogger } from '@app-types';

export class EventBus implements IEventBus {
  private static instance: EventBus;
  private events = new Map<string, Set<EventHandler>>();
  private logger?: ILogger;

  private constructor(logger?: ILogger) {
    this.logger = logger;
  }

  static getInstance(logger?: ILogger): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(logger);
    }
    return EventBus.instance;
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: unknown): void {
    const handlers = this.events.get(event);

    if (!handlers || handlers.size === 0) {
      this.logger?.debug(`No handlers for event: ${event}`);
      return;
    }

    this.logger?.debug(`Emitting event: ${event}`, data);

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        this.logger?.error(
          `Error in event handler for: ${event}`,
          error as Error
        );
      }
    });
  }

  /**
   * Subscribe to an event
   * Returns unsubscribe function
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const handlers = this.events.get(event)!;
    handlers.add(handler);

    this.logger?.debug(`Subscribed to event: ${event}`);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event once
   * Auto-unsubscribes after first call
   */
  once(event: string, handler: EventHandler): () => void {
    const wrappedHandler = (data?: unknown) => {
      handler(data);
      this.off(event, wrappedHandler);
    };

    return this.on(event, wrappedHandler);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);

    if (handlers) {
      handlers.delete(handler);

      if (handlers.size === 0) {
        this.events.delete(event);
      }

      this.logger?.debug(`Unsubscribed from event: ${event}`);
    }
  }

  /**
   * Clear all event handlers
   */
  clear(): void {
    this.events.clear();
    this.logger?.info('Event bus cleared');
  }

  /**
   * Get count of handlers for an event
   */
  getHandlerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }
}
