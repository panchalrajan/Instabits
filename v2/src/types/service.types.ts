/**
 * Service Type Definitions
 * Interfaces for all core services following Interface Segregation Principle
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, error?: Error, ...args: unknown[]): void;
  setLevel(level: LogLevel): void;
}

export interface IStorage {
  get<T>(key: string): Promise<T | null>;
  get<T>(keys: string[]): Promise<Record<string, T>>;
  set<T>(key: string, value: T): Promise<void>;
  set<T>(items: Record<string, T>): Promise<void>;
  remove(key: string | string[]): Promise<void>;
  clear(): Promise<void>;
  onChanged(callback: (changes: StorageChanges) => void): void;
}

export interface StorageChanges {
  [key: string]: {
    oldValue?: unknown;
    newValue?: unknown;
  };
}

export interface ICache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
}

export interface IErrorHandler {
  handle(error: Error, context?: ErrorContext): void;
  register(handler: ErrorHandlerFn): void;
  setGlobalHandler(): void;
}

export interface ErrorContext {
  feature?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export type ErrorHandlerFn = (error: Error, context?: ErrorContext) => void;

export interface IMessageService {
  send<T = unknown>(message: Message): Promise<T>;
  sendToBackground<T = unknown>(message: Message): Promise<T>;
  sendToContent<T = unknown>(tabId: number, message: Message): Promise<T>;
  onMessage<T = unknown>(handler: MessageHandler<T>): void;
}

export interface Message {
  type: string;
  payload?: unknown;
}

export type MessageHandler<T = unknown> = (
  message: Message,
  sender: chrome.runtime.MessageSender
) => Promise<T> | T | void;

export interface IVideoObserver {
  start(): void;
  stop(): void;
  onVideoDetected(callback: VideoCallback): () => void;
  onVideoRemoved(callback: VideoCallback): () => void;
}

export type VideoCallback = (video: HTMLVideoElement) => void;

export interface IDOMUtils {
  createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: ElementOptions
  ): HTMLElementTagNameMap[K];

  findVideo(element: Element): HTMLVideoElement | null;
  findAllVideos(root?: Element): HTMLVideoElement[];

  waitForElement(
    selector: string,
    timeout?: number
  ): Promise<Element | null>;

  isElementVisible(element: Element): boolean;
  isElementInViewport(element: Element): boolean;
}

export interface ElementOptions {
  className?: string;
  id?: string;
  textContent?: string;
  innerHTML?: string;
  attributes?: Record<string, string>;
  styles?: Partial<CSSStyleDeclaration>;
  children?: HTMLElement[];
  events?: Record<string, EventListener>;
}

export interface IEventBus {
  emit(event: string, data?: unknown): void;
  on(event: string, handler: EventHandler): () => void;
  once(event: string, handler: EventHandler): () => void;
  off(event: string, handler: EventHandler): void;
  clear(): void;
}

export type EventHandler = (data?: unknown) => void;

export interface IServiceContainer {
  register<T>(name: string, service: T | ServiceFactory<T>): void;
  get<T>(name: string): T;
  has(name: string): boolean;
  clear(): void;
}

export type ServiceFactory<T> = () => T;
