/**
 * Message Service - Runtime messaging abstraction
 * Simplifies communication between different parts of the extension
 */

import { logger } from './Logger';
import { MessageType, type RuntimeMessage } from '@/types/global';

type MessageHandler<T = any> = (payload: T) => void | Promise<void>;

class MessageService {
  private static instance: MessageService;
  private handlers: Map<MessageType, Set<MessageHandler>> = new Map();

  private constructor() {
    this.setupMessageListener();
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  /**
   * Setup Chrome runtime message listener
   */
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
      if (!message.type) {
        logger.warn('MessageService', 'Received message without type', message);
        return false;
      }

      logger.debug('MessageService', `Received message: ${message.type}`, message.payload);

      const handlers = this.handlers.get(message.type);
      if (handlers && handlers.size > 0) {
        // Execute all handlers for this message type
        const promises: Promise<void>[] = [];

        handlers.forEach((handler) => {
          try {
            const result = handler(message.payload);
            if (result instanceof Promise) {
              promises.push(result);
            }
          } catch (error) {
            logger.error('MessageService', `Error in message handler for ${message.type}`, error);
          }
        });

        // If there are async handlers, wait for them
        if (promises.length > 0) {
          Promise.all(promises)
            .then(() => sendResponse({ success: true }))
            .catch((error) => {
              logger.error('MessageService', 'Error executing async handlers', error);
              sendResponse({ success: false, error: error.message });
            });
          return true; // Keep channel open for async response
        }
      }

      sendResponse({ success: true });
      return false;
    });
  }

  /**
   * Register a message handler
   */
  public on<T = any>(type: MessageType, handler: MessageHandler<T>): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    logger.debug('MessageService', `Registered handler for: ${type}`);
  }

  /**
   * Unregister a message handler
   */
  public off(type: MessageType, handler: MessageHandler): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    }
  }

  /**
   * Send a message to all tabs
   */
  public async broadcast<T = any>(type: MessageType, payload: T): Promise<void> {
    const message: RuntimeMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    try {
      const tabs = await chrome.tabs.query({ url: 'https://*.instagram.com/*' });

      const promises = tabs.map((tab) => {
        if (tab.id) {
          return chrome.tabs.sendMessage(tab.id, message).catch((error) => {
            logger.debug('MessageService', `Tab ${tab.id} not ready:`, error.message);
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      logger.debug('MessageService', `Broadcasted ${type} to ${tabs.length} tabs`);
    } catch (error) {
      logger.error('MessageService', `Error broadcasting ${type}`, error);
    }
  }

  /**
   * Send a message to a specific tab
   */
  public async sendToTab<T = any>(tabId: number, type: MessageType, payload: T): Promise<any> {
    const message: RuntimeMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    try {
      const response = await chrome.tabs.sendMessage(tabId, message);
      logger.debug('MessageService', `Sent ${type} to tab ${tabId}`);
      return response;
    } catch (error) {
      logger.error('MessageService', `Error sending ${type} to tab ${tabId}`, error);
      throw error;
    }
  }

  /**
   * Send a message to the background script
   */
  public async sendToBackground<T = any>(type: MessageType, payload: T): Promise<any> {
    const message: RuntimeMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    try {
      const response = await chrome.runtime.sendMessage(message);
      logger.debug('MessageService', `Sent ${type} to background`);
      return response;
    } catch (error) {
      logger.error('MessageService', `Error sending ${type} to background`, error);
      throw error;
    }
  }

  /**
   * Clear all handlers (useful for cleanup)
   */
  public clearHandlers(): void {
    this.handlers.clear();
    logger.info('MessageService', 'Cleared all message handlers');
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();
