// InstaBits Utilities
// Helper functions for feature management
// Now uses StorageService internally for better abstraction

class InstaBitsUtils {
  /**
   * Check if a feature is enabled in settings (async)
   * @param {string} featureId - The feature ID (e.g., 'playbackSpeed', 'volumeSlider')
   * @returns {Promise<boolean>} True if enabled, false if disabled
   */
  static async isFeatureEnabled(featureId) {
    return await storageService.getFeatureState(featureId);
  }

  /**
   * Set feature enabled state (async)
   * @param {string} featureId - The feature ID
   * @param {boolean} enabled - True to enable, false to disable
   * @returns {Promise<boolean>} Success status
   */
  static async setFeatureEnabled(featureId, enabled) {
    return await storageService.setFeatureState(featureId, enabled);
  }

  /**
   * Get all feature states (async)
   * @returns {Promise<Object>} Object with feature IDs as keys and boolean values
   */
  static async getAllFeatureStates() {
    return await storageService.getAllFeatureStates();
  }

  /**
   * Get user preference
   * @param {string} key - Preference key
   * @param {*} defaultValue - Default value
   * @returns {Promise<*>} Preference value
   */
  static async getUserPreference(key, defaultValue = null) {
    return await storageService.getUserPreference(key, defaultValue);
  }

  /**
   * Set user preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   * @returns {Promise<boolean>} Success status
   */
  static async setUserPreference(key, value) {
    return await storageService.setUserPreference(key, value);
  }
}
