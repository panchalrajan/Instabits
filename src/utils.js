// InstaBits Utilities
// Helper functions for feature management using Chrome Storage API

class InstaBitsUtils {
  /**
   * Check if a feature is enabled in settings (async)
   * @param {string} featureId - The feature ID (e.g., 'playbackSpeed', 'volumeSlider')
   * @returns {Promise<boolean>} True if enabled, false if disabled
   */
  static async isFeatureEnabled(featureId) {
    return new Promise((resolve) => {
      const storageKey = `instabits_feature_${featureId}`;

      chrome.storage.sync.get([storageKey], (result) => {
        const isEnabled = result[storageKey] === undefined ? true : result[storageKey] === true;

        console.log(`[InstaBits] Feature check: ${featureId}`, {
          storageKey,
          savedValue: result[storageKey],
          isEnabled
        });

        resolve(isEnabled);
      });
    });
  }

  /**
   * Set feature enabled state (async)
   * @param {string} featureId - The feature ID
   * @param {boolean} enabled - True to enable, false to disable
   * @returns {Promise<void>}
   */
  static async setFeatureEnabled(featureId, enabled) {
    return new Promise((resolve) => {
      const storageKey = `instabits_feature_${featureId}`;
      const data = {};
      data[storageKey] = enabled;

      chrome.storage.sync.set(data, () => {
        console.log(`[InstaBits] Feature set: ${featureId} = ${enabled}`);
        resolve();
      });
    });
  }

  /**
   * Get all feature states (async)
   * @returns {Promise<Object>} Object with feature IDs as keys and boolean values
   */
  static async getAllFeatureStates() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (items) => {
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
}
