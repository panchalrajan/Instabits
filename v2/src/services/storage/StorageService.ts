/**
 * Storage Service
 * Wrapper around chrome.storage.sync with caching
 * Implements Single Responsibility and Dependency Inversion principles
 */

import type { IStorage, StorageChanges } from '@app-types';
import type { ICache } from '@app-types';
import type { ILogger } from '@app-types';
import { CacheService } from './CacheService';

export class StorageService implements IStorage {
  private static instance: StorageService;
  private cache: ICache;
  private logger: ILogger;
  private changeListeners: ((changes: StorageChanges) => void)[] = [];

  private constructor(logger: ILogger, cache?: ICache) {
    this.logger = logger;
    this.cache = cache || new CacheService();
    this.setupStorageListener();
  }

  static getInstance(logger: ILogger, cache?: ICache): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(logger, cache);
    }
    return StorageService.instance;
  }

  /**
   * Get a single value or multiple values
   */
  async get<T>(key: string): Promise<T | null>;
  async get<T>(keys: string[]): Promise<Record<string, T>>;
  async get<T>(
    keyOrKeys: string | string[]
  ): Promise<T | null | Record<string, T>> {
    try {
      // Single key
      if (typeof keyOrKeys === 'string') {
        // Check cache first
        if (this.cache.has(keyOrKeys)) {
          this.logger.debug(`Cache hit for key: ${keyOrKeys}`);
          return this.cache.get<T>(keyOrKeys);
        }

        // Get from chrome.storage
        const result = await chrome.storage.sync.get(keyOrKeys);
        const value = result[keyOrKeys] as T | undefined;

        if (value !== undefined) {
          this.cache.set(keyOrKeys, value);
          return value;
        }

        return null;
      }

      // Multiple keys
      const uncachedKeys: string[] = [];
      const cachedResult: Record<string, T> = {};

      keyOrKeys.forEach((key) => {
        if (this.cache.has(key)) {
          const value = this.cache.get<T>(key);
          if (value !== null) {
            cachedResult[key] = value;
          }
        } else {
          uncachedKeys.push(key);
        }
      });

      if (uncachedKeys.length > 0) {
        const result = await chrome.storage.sync.get(uncachedKeys);

        Object.entries(result).forEach(([key, value]) => {
          this.cache.set(key, value);
          cachedResult[key] = value as T;
        });
      }

      return cachedResult;
    } catch (error) {
      this.logger.error('Storage get error', error as Error, { keyOrKeys });
      throw error;
    }
  }

  /**
   * Set a single value or multiple values
   */
  async set<T>(key: string, value: T): Promise<void>;
  async set<T>(items: Record<string, T>): Promise<void>;
  async set<T>(
    keyOrItems: string | Record<string, T>,
    value?: T
  ): Promise<void> {
    try {
      let items: Record<string, T>;

      if (typeof keyOrItems === 'string') {
        items = { [keyOrItems]: value! };
      } else {
        items = keyOrItems;
      }

      // Update cache
      Object.entries(items).forEach(([key, val]) => {
        this.cache.set(key, val);
      });

      // Save to chrome.storage
      await chrome.storage.sync.set(items);
      this.logger.debug('Storage set success', Object.keys(items));
    } catch (error) {
      this.logger.error('Storage set error', error as Error, { keyOrItems });
      throw error;
    }
  }

  /**
   * Remove one or more keys
   */
  async remove(key: string | string[]): Promise<void> {
    try {
      const keys = Array.isArray(key) ? key : [key];

      // Remove from cache
      keys.forEach((k) => this.cache.delete(k));

      // Remove from chrome.storage
      await chrome.storage.sync.remove(keys);
      this.logger.debug('Storage remove success', keys);
    } catch (error) {
      this.logger.error('Storage remove error', error as Error, { key });
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      this.cache.clear();
      await chrome.storage.sync.clear();
      this.logger.info('Storage cleared');
    } catch (error) {
      this.logger.error('Storage clear error', error as Error);
      throw error;
    }
  }

  /**
   * Listen to storage changes
   */
  onChanged(callback: (changes: StorageChanges) => void): void {
    this.changeListeners.push(callback);
  }

  /**
   * Set up chrome.storage change listener
   */
  private setupStorageListener(): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        // Update cache
        Object.entries(changes).forEach(([key, { newValue }]) => {
          if (newValue !== undefined) {
            this.cache.set(key, newValue);
          } else {
            this.cache.delete(key);
          }
        });

        // Notify listeners
        this.changeListeners.forEach((listener) => {
          try {
            listener(changes);
          } catch (error) {
            this.logger.error(
              'Error in storage change listener',
              error as Error
            );
          }
        });
      }
    });
  }
}
