// InstaBits - Main Application Entry Point
// Now using FeatureManager and VideoObserver for better architecture

(async function() {
  'use strict';

  /**
   * Register all available features with the FeatureManager
   */
  function registerFeatures() {
    if (typeof featureManager === 'undefined') {
      console.error('[InstaBits] FeatureManager not loaded');
      return false;
    }

    try {
      featureManager
        .register('fullScreen', FullScreen, { useVideoObserver: true, priority: 10, defaultEnabled: true })
        .register('playbackSpeed', PlaybackSpeed, { useVideoObserver: true, priority: 9, defaultEnabled: true })
        .register('pipMode', PIPMode, { useVideoObserver: true, priority: 8, defaultEnabled: true })
        .register('videoDuration', VideoDuration, { useVideoObserver: true, priority: 7, defaultEnabled: true })
        .register('videoSeekbar', VideoSeekbar, { useVideoObserver: true, priority: 6, defaultEnabled: true })
        .register('volumeSlider', VolumeSlider, { useVideoObserver: true, priority: 5, defaultEnabled: true })
        .register('zenMode', ZenMode, { useVideoObserver: true, priority: 4, defaultEnabled: true })
        .register('backgroundPlay', BackgroundPlay, { useVideoObserver: false, priority: 3, defaultEnabled: true })
        .register('autoScroll', AutoScroll, { useVideoObserver: false, priority: 2, defaultEnabled: true })
        .register('disableDoubleTapLike', DisableDoubleTapLike, { useVideoObserver: false, priority: 1, defaultEnabled: false })
        .register('hideSuggestedFollowers', HideSuggestedFollowers, { useVideoObserver: false, priority: 0, defaultEnabled: false });
      return true;
    } catch (error) {
      console.error('[InstaBits] Error registering features:', error);
      return false;
    }
  }

  /**
   * Initialize the extension with new architecture
   */
  async function init() {
    try {
      // Check if required dependencies are loaded
      if (typeof featureManager === 'undefined') {
        console.error('[InstaBits] FeatureManager not available');
        return;
      }

      if (typeof videoObserver === 'undefined') {
        console.error('[InstaBits] VideoObserver not available');
        return;
      }

      // Register all features
      const registered = registerFeatures();
      if (!registered) {
        console.error('[InstaBits] Failed to register features');
        return;
      }

      // Initialize feature manager (automatically enables features based on settings)
      await featureManager.initialize(videoObserver);

      // Set up storage listener to handle real-time feature toggle from dashboard
      featureManager.setupStorageListener();

      console.log('[InstaBits] Extension initialized successfully');
    } catch (error) {
      console.error('[InstaBits] Error during initialization:', error);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    try {
      if (typeof featureManager !== 'undefined' && featureManager.cleanup) {
        featureManager.cleanup();
      }
    } catch (error) {
      console.error('[InstaBits] Error during cleanup:', error);
    }
  });

})();
