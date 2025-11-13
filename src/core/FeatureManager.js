/**
 * FeatureManager - Centralized feature initialization and management
 *
 * Responsibilities:
 * - Maintain registry of all available features
 * - Check which features are enabled via StorageService
 * - Initialize only enabled features
 * - Register features with VideoObserver
 * - Provide methods to enable/disable features dynamically
 * - Handle feature lifecycle
 *
 * Benefits:
 * - Follows Open/Closed Principle - add new features without modifying core code
 * - Single source of truth for feature management
 * - Automatic integration with VideoObserver
 * - Easy testing and configuration
 */
class FeatureManager {
  constructor() {
    this.featureRegistry = new Map();
    this.activeFeatures = new Map();
    this.videoObserver = null;
    this.isInitialized = false;
  }

  /**
   * Register a feature class
   * @param {string} featureId - Feature identifier (e.g., 'playbackSpeed')
   * @param {class} FeatureClass - Feature class constructor
   * @param {Object} options - Additional options
   * @returns {FeatureManager} For chaining
   */
  register(featureId, FeatureClass, options = {}) {
    if (!featureId || !FeatureClass) {
      console.warn('FeatureManager: Invalid feature registration', featureId);
      return this;
    }

    this.featureRegistry.set(featureId, {
      id: featureId,
      FeatureClass,
      options: {
        useVideoObserver: options.useVideoObserver !== false, // Default: true
        autoEnable: options.autoEnable !== false, // Default: true
        priority: options.priority || 0, // For initialization order
        defaultEnabled: options.defaultEnabled !== undefined ? options.defaultEnabled : true // Default enabled state
      }
    });

    return this; // Allow chaining
  }

  /**
   * Register multiple features at once
   * @param {Object} features - Object mapping feature IDs to classes
   * @returns {FeatureManager} For chaining
   */
  registerMultiple(features) {
    Object.entries(features).forEach(([id, FeatureClass]) => {
      this.register(id, FeatureClass);
    });
    return this;
  }

  /**
   * Initialize all enabled features
   * @param {Object} videoObserverInstance - VideoObserver instance to use
   * @returns {Promise<void>}
   */
  async initialize(videoObserverInstance = null) {
    if (this.isInitialized) {
      console.warn('FeatureManager: Already initialized');
      return;
    }

    // Set video observer
    this.videoObserver = videoObserverInstance || videoObserver;

    // Get all feature IDs and their default states
    const featureIds = Array.from(this.featureRegistry.keys());
    const defaultStates = {};
    this.featureRegistry.forEach((config, id) => {
      defaultStates[id] = config.options.defaultEnabled;
    });

    // Get enabled states from storage with defaults
    const enabledStates = await storageService.getAllFeatureStates(featureIds, defaultStates);

    // Sort features by priority
    const sortedFeatures = Array.from(this.featureRegistry.values())
      .sort((a, b) => b.options.priority - a.options.priority);

    // Initialize enabled features
    for (const featureConfig of sortedFeatures) {
      const { id, FeatureClass, options } = featureConfig;

      // Check if feature should be enabled
      const isEnabled = enabledStates[id];
      const shouldEnable = options.autoEnable && isEnabled;

      if (shouldEnable) {
        await this.enableFeature(id, false); // false = don't save to storage
      }
    }

    // Start video observer if we have features
    if (this.activeFeatures.size > 0 && this.videoObserver) {
      this.videoObserver.start();
    }

    this.isInitialized = true;
  }

  /**
   * Enable a feature
   * @param {string} featureId - Feature identifier
   * @param {boolean} saveToStorage - Whether to save state to storage
   * @returns {Promise<boolean>} Success status
   */
  async enableFeature(featureId, saveToStorage = true) {
    // Check if already enabled
    if (this.activeFeatures.has(featureId)) {
      return true;
    }

    // Get feature config
    const featureConfig = this.featureRegistry.get(featureId);
    if (!featureConfig) {
      console.warn(`FeatureManager: Feature ${featureId} not registered`);
      return false;
    }

    try {
      // Instantiate feature
      const { FeatureClass, options } = featureConfig;
      const featureInstance = new FeatureClass();

      // Store instance
      this.activeFeatures.set(featureId, featureInstance);

      // Register with video observer if applicable
      if (options.useVideoObserver && this.videoObserver) {
        this.videoObserver.subscribe(featureInstance);
      } else {
        // Manually process existing videos for features not using observer
        if (featureInstance.processAllVideos) {
          featureInstance.processAllVideos();
        }
      }

      // Save to storage if requested
      if (saveToStorage) {
        await storageService.setFeatureState(featureId, true);
      }

      return true;
    } catch (error) {
      console.error(`FeatureManager: Error enabling ${featureId}:`, error);
      return false;
    }
  }

  /**
   * Disable a feature
   * @param {string} featureId - Feature identifier
   * @param {boolean} saveToStorage - Whether to save state to storage
   * @returns {Promise<boolean>} Success status
   */
  async disableFeature(featureId, saveToStorage = true) {
    // Get feature instance
    const featureInstance = this.activeFeatures.get(featureId);
    if (!featureInstance) {
      return true; // Already disabled
    }

    try {
      // Unregister from video observer
      const featureConfig = this.featureRegistry.get(featureId);
      if (featureConfig && featureConfig.options.useVideoObserver && this.videoObserver) {
        this.videoObserver.unsubscribe(featureInstance);
      }

      // Call cleanup if available
      if (featureInstance.cleanup) {
        featureInstance.cleanup();
      }

      // Remove from active features
      this.activeFeatures.delete(featureId);

      // Save to storage if requested
      if (saveToStorage) {
        await storageService.setFeatureState(featureId, false);
      }

      return true;
    } catch (error) {
      console.error(`FeatureManager: Error disabling ${featureId}:`, error);
      return false;
    }
  }

  /**
   * Toggle a feature on/off
   * @param {string} featureId - Feature identifier
   * @returns {Promise<boolean>} New enabled state
   */
  async toggleFeature(featureId) {
    const isEnabled = this.isFeatureEnabled(featureId);

    if (isEnabled) {
      await this.disableFeature(featureId);
      return false;
    } else {
      await this.enableFeature(featureId);
      return true;
    }
  }

  /**
   * Check if a feature is currently enabled
   * @param {string} featureId - Feature identifier
   * @returns {boolean}
   */
  isFeatureEnabled(featureId) {
    return this.activeFeatures.has(featureId);
  }

  /**
   * Get feature instance
   * @param {string} featureId - Feature identifier
   * @returns {*} Feature instance or null
   */
  getFeature(featureId) {
    return this.activeFeatures.get(featureId) || null;
  }

  /**
   * Get all active feature instances
   * @returns {Map<string, *>}
   */
  getAllActiveFeatures() {
    return new Map(this.activeFeatures);
  }

  /**
   * Get all registered feature IDs
   * @returns {string[]}
   */
  getAllFeatureIds() {
    return Array.from(this.featureRegistry.keys());
  }

  /**
   * Reload a feature (disable then enable)
   * @param {string} featureId - Feature identifier
   * @returns {Promise<boolean>}
   */
  async reloadFeature(featureId) {
    const wasEnabled = this.isFeatureEnabled(featureId);

    if (wasEnabled) {
      await this.disableFeature(featureId, false);
    }

    await this.enableFeature(featureId, false);
    return true;
  }

  /**
   * Cleanup all features
   */
  cleanup() {
    // Disable all features
    const featureIds = Array.from(this.activeFeatures.keys());
    featureIds.forEach(id => {
      this.disableFeature(id, false);
    });

    // Stop video observer
    if (this.videoObserver) {
      this.videoObserver.stop();
    }

    this.isInitialized = false;
  }

  /**
   * Listen for storage changes and update features accordingly
   */
  setupStorageListener() {
    storageService.addChangeListener(async (changes, areaName) => {
      try {
        // Only respond to sync storage changes
        if (areaName !== 'sync') {
          return;
        }

        // Check for feature state changes
        for (const [key, { newValue }] of Object.entries(changes)) {
          if (key.startsWith('instabits_feature_')) {
            const featureId = key.replace('instabits_feature_', '');

            // Only update if this feature is registered
            if (this.featureRegistry.has(featureId)) {
              try {
                if (newValue === true) {
                  await this.enableFeature(featureId, false);
                } else {
                  await this.disableFeature(featureId, false);
                }
              } catch (error) {
                console.error(`FeatureManager: Error toggling ${featureId}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error('FeatureManager: Error in storage listener:', error);
      }
    });
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    return {
      totalRegistered: this.featureRegistry.size,
      totalActive: this.activeFeatures.size,
      videoObserverActive: this.videoObserver ? this.videoObserver.isActive() : false,
      isInitialized: this.isInitialized
    };
  }
}

// Create singleton instance
const featureManager = new FeatureManager();
