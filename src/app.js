// InstaBits - Main Application Entry Point
// Now using FeatureManager and VideoObserver for better architecture

(async function() {
  'use strict';

  /**
   * Register all available features with the FeatureManager
   */
  function registerFeatures() {
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
      .register('hideReels', HideReels, { useVideoObserver: false, priority: 1, defaultEnabled: false })
      .register('hideExplore', HideExplore, { useVideoObserver: false, priority: 1, defaultEnabled: false })
      .register('hideStories', HideStories, { useVideoObserver: false, priority: 1, defaultEnabled: false })
      .register('hideSuggestedFollowers', HideSuggestedFollowers, { useVideoObserver: false, priority: 1, defaultEnabled: false })
      .register('hideThreads', HideThreads, { useVideoObserver: false, priority: 1, defaultEnabled: false });
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
