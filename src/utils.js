// InstaBits Utilities
// Helper functions for feature management

class InstaBitsUtils {
  /**
   * Check if a feature is enabled in settings
   * @param {string} featureId - The feature ID (e.g., 'playbackSpeed', 'volumeSlider')
   * @returns {boolean} True if enabled, false if disabled
   */
  static isFeatureEnabled(featureId) {
    const storageKey = `instabits_feature_${featureId}`;
    const saved = localStorage.getItem(storageKey);
    // Default to enabled if not set
    return saved === null ? true : saved === 'true';
  }

  /**
   * Set feature enabled state
   * @param {string} featureId - The feature ID
   * @param {boolean} enabled - True to enable, false to disable
   */
  static setFeatureEnabled(featureId, enabled) {
    const storageKey = `instabits_feature_${featureId}`;
    localStorage.setItem(storageKey, enabled.toString());
  }
}
