// InstaBits - Main Application Entry Point
// Now using FeatureManager and VideoObserver for better architecture

(async function() {
  'use strict';

  /**
   * Register all available features with the FeatureManager
   */
  function registerFeatures() {
    featureManager
      .register('videoDuration', VideoDuration, { useVideoObserver: true, priority: 5 })
      .register('videoSeekbar', VideoSeekbar, { useVideoObserver: true, priority: 4 })
      .register('volumeSlider', VolumeSlider, { useVideoObserver: true, priority: 3 })
      .register('playbackSpeed', PlaybackSpeed, { useVideoObserver: true, priority: 2 })
      .register('pipMode', PIPMode, { useVideoObserver: true, priority: 1 })
      .register('backgroundPlay', BackgroundPlay, { useVideoObserver: false, priority: 10 })
      .register('autoScroll', AutoScroll, { useVideoObserver: false, priority: 9 });
  }

  /**
   * Initialize the extension with new architecture
   */
  async function init() {
    // Register all features
    registerFeatures();

    // Initialize feature manager (automatically enables features based on settings)
    await featureManager.initialize(videoObserver);

    // Set up storage listener to handle real-time feature toggle from dashboard
    featureManager.setupStorageListener();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    featureManager.cleanup();
  });

})();
