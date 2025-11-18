/**
 * Storage Service - Abstraction over Chrome Storage API
 * Provides caching, type safety, and simplified API
 */

import { logger } from './Logger';
import type { StorageChangeEvent } from '@/types/global';

type StorageChangeListener = (event: StorageChangeEvent) => void;

class StorageService {
  private static instance: StorageService;
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5000; // 5 seconds
  private listeners: Set<StorageChangeListener> = new Set();

  private constructor() {
    this.setupStorageListener();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Setup Chrome storage change listener
   */
  private setupStorageListener(): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        Object.keys(changes).forEach((key) => {
          // Invalidate cache
          this.cache.delete(key);

          // Notify listeners
          const event: StorageChangeEvent = {
            key,
            newValue: changes[key].newValue,
            oldValue: changes[key].oldValue,
          };
          this.notifyListeners(event);
        });
      }
    });
  }

  /**
   * Get value from cache or storage
   */
  public async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    try {
      // Check cache first
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.debug('StorageService', `Cache hit for key: ${key}`);
        return cached.value as T;
      }

      // Fetch from storage
      const result = await chrome.storage.sync.get(key);
      const value = result[key] !== undefined ? result[key] : defaultValue;

      // Update cache
      this.cache.set(key, { value, timestamp: Date.now() });

      return value as T;
    } catch (error) {
      logger.error('StorageService', `Error getting key: ${key}`, error);
      return defaultValue as T;
    }
  }

  /**
   * Set value in storage
   */
  public async set(key: string, value: any): Promise<void> {
    try {
      await chrome.storage.sync.set({ [key]: value });

      // Update cache
      this.cache.set(key, { value, timestamp: Date.now() });

      logger.debug('StorageService', `Set key: ${key}`, value);
    } catch (error) {
      logger.error('StorageService', `Error setting key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get multiple values at once
   */
  public async getMultiple<T extends Record<string, any>>(
    keys: string[],
    defaults?: Partial<T>
  ): Promise<T> {
    try {
      const result = await chrome.storage.sync.get(keys);
      const merged = { ...defaults, ...result };

      // Update cache
      Object.keys(merged).forEach((key) => {
        this.cache.set(key, { value: merged[key], timestamp: Date.now() });
      });

      return merged as T;
    } catch (error) {
      logger.error('StorageService', 'Error getting multiple keys', error);
      return (defaults || {}) as T;
    }
  }

  /**
   * Set multiple values at once
   */
  public async setMultiple(items: Record<string, any>): Promise<void> {
    try {
      await chrome.storage.sync.set(items);

      // Update cache
      Object.entries(items).forEach(([key, value]) => {
        this.cache.set(key, { value, timestamp: Date.now() });
      });

      logger.debug('StorageService', 'Set multiple items', items);
    } catch (error) {
      logger.error('StorageService', 'Error setting multiple items', error);
      throw error;
    }
  }

  /**
   * Remove a key from storage
   */
  public async remove(key: string): Promise<void> {
    try {
      await chrome.storage.sync.remove(key);
      this.cache.delete(key);
      logger.debug('StorageService', `Removed key: ${key}`);
    } catch (error) {
      logger.error('StorageService', `Error removing key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  public async clear(): Promise<void> {
    try {
      await chrome.storage.sync.clear();
      this.cache.clear();
      logger.info('StorageService', 'Cleared all storage');
    } catch (error) {
      logger.error('StorageService', 'Error clearing storage', error);
      throw error;
    }
  }

  /**
   * Get feature enabled state
   */
  public async getFeatureState(featureId: string): Promise<boolean> {
    const key = `instabits_feature_${featureId}`;
    return this.get<boolean>(key, true);
  }

  /**
   * Set feature enabled state
   */
  public async setFeatureState(featureId: string, enabled: boolean): Promise<void> {
    const key = `instabits_feature_${featureId}`;
    await this.set(key, enabled);
  }

  /**
   * Get all feature states
   */
  public async getAllFeatureStates(
    featureIds: string[],
    defaultStates?: Record<string, boolean>
  ): Promise<Record<string, boolean>> {
    const keys = featureIds.map((id) => `instabits_feature_${id}`);
    const defaults = defaultStates || {};

    const result = await this.getMultiple(keys, defaults);

    // Convert back to feature ID keys
    const states: Record<string, boolean> = {};
    featureIds.forEach((id) => {
      const key = `instabits_feature_${id}`;
      states[id] = result[key] !== undefined ? result[key] : true;
    });

    return states;
  }

  /**
   * Get user preference
   */
  public async getUserPreference<T = any>(key: string, defaultValue?: T): Promise<T> {
    const prefKey = `pref_${key}`;
    return this.get<T>(prefKey, defaultValue);
  }

  /**
   * Set user preference
   */
  public async setUserPreference(key: string, value: any): Promise<void> {
    const prefKey = `pref_${key}`;
    await this.set(prefKey, value);
  }

  /**
   * Add storage change listener
   */
  public addChangeListener(listener: StorageChangeListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove storage change listener
   */
  public removeChangeListener(listener: StorageChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of a change
   */
  private notifyListeners(event: StorageChangeEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        logger.error('StorageService', 'Error in change listener', error);
      }
    });
  }

  /**
   * Clear cache (useful for testing)
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
