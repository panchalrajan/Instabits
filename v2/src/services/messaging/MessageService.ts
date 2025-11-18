/**
 * Message Service
 * Handles communication between extension contexts
 * (background, content scripts, popup)
 */

import type {
  IMessageService,
  Message,
  MessageHandler,
} from '@app-types';
import type { ILogger } from '@app-types';

export class MessageService implements IMessageService {
  private static instance: MessageService;
  private logger: ILogger;
  private handlers = new Map<string, MessageHandler[]>();

  private constructor(logger: ILogger) {
    this.logger = logger;
    this.setupMessageListener();
  }

  static getInstance(logger: ILogger): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService(logger);
    }
    return MessageService.instance;
  }

  /**
   * Send a message (generic)
   */
  async send<T = unknown>(message: Message): Promise<T> {
    try {
      this.logger.debug(`Sending message: ${message.type}`, message);
      const response = await chrome.runtime.sendMessage(message);
      return response as T;
    } catch (error) {
      this.logger.error(
        `Error sending message: ${message.type}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Send a message to background script
   */
  async sendToBackground<T = unknown>(message: Message): Promise<T> {
    return this.send<T>(message);
  }

  /**
   * Send a message to content script
   */
  async sendToContent<T = unknown>(
    tabId: number,
    message: Message
  ): Promise<T> {
    try {
      this.logger.debug(
        `Sending message to tab ${tabId}: ${message.type}`,
        message
      );
      const response = await chrome.tabs.sendMessage(tabId, message);
      return response as T;
    } catch (error) {
      this.logger.error(
        `Error sending message to tab ${tabId}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Register a message handler
   */
  onMessage<T = unknown>(handler: MessageHandler<T>): void {
    const wrappedHandler = async (message: Message, sender: chrome.runtime.MessageSender) => {
      try {
        const result = await handler(message, sender);
        return result;
      } catch (error) {
        this.logger.error(
          `Error in message handler for: ${message.type}`,
          error as Error
        );
        throw error;
      }
    };

    // Store by message type if available
    const handlers = this.handlers.get('*') || [];
    handlers.push(wrappedHandler as MessageHandler);
    this.handlers.set('*', handlers);
  }

  /**
   * Register a handler for specific message type
   */
  onMessageType<T = unknown>(
    type: string,
    handler: (payload: unknown, sender: chrome.runtime.MessageSender) => Promise<T> | T
  ): void {
    const handlers = this.handlers.get(type) || [];
    handlers.push(async (message: Message, sender) => {
      if (message.type === type) {
        return await handler(message.payload, sender);
      }
      return undefined;
    });
    this.handlers.set(type, handlers);
  }

  /**
   * Set up chrome.runtime message listener
   */
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener(
      (
        message: Message,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void
      ) => {
        this.logger.debug(`Received message: ${message.type}`, message);

        // Get handlers for this message type
        const typeHandlers = this.handlers.get(message.type) || [];
        const wildcardHandlers = this.handlers.get('*') || [];
        const allHandlers = [...typeHandlers, ...wildcardHandlers];

        if (allHandlers.length === 0) {
          this.logger.warn(`No handler for message type: ${message.type}`);
          return false;
        }

        // Execute handlers
        Promise.all(
          allHandlers.map((handler) => handler(message, sender))
        )
          .then((results) => {
            // Send first non-undefined result
            const result = results.find((r) => r !== undefined);
            sendResponse(result);
          })
          .catch((error) => {
            this.logger.error(
              `Error handling message: ${message.type}`,
              error as Error
            );
            sendResponse({ error: error.message });
          });

        return true; // Keep channel open for async response
      }
    );
  }
}
