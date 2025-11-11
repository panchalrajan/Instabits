/**
 * StorageService - Centralized storage management for InstaBits
 *
 * Abstracts chrome.storage.sync API to:
 * - Provide consistent interface for all storage operations
 * - Enable easy testing and mocking
 * - Support future migration to other storage backends
 * - Handle errors gracefully
 */
class StorageService {
  constructor(storageAPI = chrome.storage.sync) {
    this.storage = storageAPI;
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds cache
  }

  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {Promise<*>} The stored value or default
   */
  async get(key, defaultValue = null) {
    try {
      // Check cache first
      const cached = this.getCached(key);
      if (cached !== undefined) {
        return cached;
      }

      return new Promise((resolve) => {
        this.storage.get(key, (result) => {
          if (chrome.runtime.lastError) {
            console.warn(`StorageService: Error getting ${key}:`, chrome.runtime.lastError);
            resolve(defaultValue);
            return;
          }

          const value = result[key] !== undefined ? result[key] : defaultValue;
          this.setCache(key, value);
          resolve(value);
        });
      });
    } catch (error) {
      console.error(`StorageService: Error getting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Get multiple values from storage
   * @param {string[]} keys - Array of storage keys
   * @param {Object} defaults - Object with default values
   * @returns {Promise<Object>} Object with requested values
   */
  async getMultiple(keys, defaults = {}) {
    try {
      return new Promise((resolve) => {
        this.storage.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            console.warn('StorageService: Error getting multiple keys:', chrome.runtime.lastError);
            resolve(defaults);
            return;
          }

          const values = { ...defaults, ...result };

          // Cache all retrieved values
          Object.entries(values).forEach(([key, value]) => {
            this.setCache(key, value);
          });

          resolve(values);
        });
      });
    } catch (error) {
      console.error('StorageService: Error getting multiple keys:', error);
      return defaults;
    }
  }

  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value) {
    try {
      return new Promise((resolve) => {
        this.storage.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.warn(`StorageService: Error setting ${key}:`, chrome.runtime.lastError);
            resolve(false);
            return;
          }

          this.setCache(key, value);
          resolve(true);
        });
      });
    } catch (error) {
      console.error(`StorageService: Error setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Set multiple values in storage
   * @param {Object} items - Object with key-value pairs
   * @returns {Promise<boolean>} Success status
   */
  async setMultiple(items) {
    try {
      return new Promise((resolve) => {
        this.storage.set(items, () => {
          if (chrome.runtime.lastError) {
            console.warn('StorageService: Error setting multiple items:', chrome.runtime.lastError);
            resolve(false);
            return;
          }

          // Cache all set values
          Object.entries(items).forEach(([key, value]) => {
            this.setCache(key, value);
          });

          resolve(true);
        });
      });
    } catch (error) {
      console.error('StorageService: Error setting multiple items:', error);
      return false;
    }
  }

  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  async remove(key) {
    try {
      return new Promise((resolve) => {
        this.storage.remove(key, () => {
          if (chrome.runtime.lastError) {
            console.warn(`StorageService: Error removing ${key}:`, chrome.runtime.lastError);
            resolve(false);
            return;
          }

          this.cache.delete(key);
          resolve(true);
        });
      });
    } catch (error) {
      console.error(`StorageService: Error removing ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      return new Promise((resolve) => {
        this.storage.clear(() => {
          if (chrome.runtime.lastError) {
            console.warn('StorageService: Error clearing storage:', chrome.runtime.lastError);
            resolve(false);
            return;
          }

          this.cache.clear();
          resolve(true);
        });
      });
    } catch (error) {
      console.error('StorageService: Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Get feature enabled state
   * @param {string} featureId - Feature identifier
   * @returns {Promise<boolean>} Whether feature is enabled
   */
  async getFeatureState(featureId) {
    const key = `instabits_feature_${featureId}`;
    return await this.get(key, true); // Default: enabled
  }

  /**
   * Set feature enabled state
   * @param {string} featureId - Feature identifier
   * @param {boolean} enabled - Whether feature should be enabled
   * @returns {Promise<boolean>} Success status
   */
  async setFeatureState(featureId, enabled) {
    const key = `instabits_feature_${featureId}`;
    return await this.set(key, enabled);
  }

  /**
   * Get all feature states
   * @param {string[]} featureIds - Array of feature identifiers (optional)
   * @returns {Promise<Object>} Object mapping feature IDs to enabled states
   */
  async getAllFeatureStates(featureIds = null) {
    if (featureIds && featureIds.length > 0) {
      const keys = featureIds.map(id => `instabits_feature_${id}`);
      const defaults = {};
      featureIds.forEach(id => {
        defaults[`instabits_feature_${id}`] = true; // Default: enabled
      });

      const result = await this.getMultiple(keys, defaults);

      // Transform keys back to feature IDs
      const states = {};
      featureIds.forEach(id => {
        states[id] = result[`instabits_feature_${id}`];
      });

      return states;
    }

    // Get all features from storage
    return new Promise((resolve) => {
      this.storage.get(null, (items) => {
        if (chrome.runtime.lastError) {
          console.warn('StorageService: Error getting all feature states:', chrome.runtime.lastError);
          resolve({});
          return;
        }

        const features = {};
        for (const key in items) {
          if (key.startsWith('instabits_feature_')) {
            const featureId = key.replace('instabits_feature_', '');
            features[featureId] = items[key];
          }
        }
        resolve(features);
      });
    });
  }

  /**
   * Get user preference
   * @param {string} key - Preference key
   * @param {*} defaultValue - Default value
   * @returns {Promise<*>} Preference value
   */
  async getUserPreference(key, defaultValue = null) {
    const prefKey = `pref_${key}`;
    return await this.get(prefKey, defaultValue);
  }

  /**
   * Set user preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   * @returns {Promise<boolean>} Success status
   */
  async setUserPreference(key, value) {
    const prefKey = `pref_${key}`;
    return await this.set(prefKey, value);
  }

  /**
   * Cache management
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (!cached) return undefined;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.value;
  }

  setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Listen for storage changes
   * @param {Function} callback - Callback function(changes, areaName)
   */
  addChangeListener(callback) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      // Update cache for changed keys
      Object.entries(changes).forEach(([key, { newValue }]) => {
        if (newValue !== undefined) {
          this.setCache(key, newValue);
        } else {
          this.cache.delete(key);
        }
      });

      callback(changes, areaName);
    });
  }
}

// Create singleton instance
const storageService = new StorageService();
