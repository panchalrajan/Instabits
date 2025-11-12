// InstaBits - Main Application Entry Point
// Now using FeatureManager and VideoObserver for better architecture

(async function() {
  'use strict';

  /**
   * Register all available features with the FeatureManager
   */
  function registerFeatures() {
    featureManager
      .register('fullScreen', FullScreen, { useVideoObserver: true, priority: 10 })
      .register('playbackSpeed', PlaybackSpeed, { useVideoObserver: true, priority: 9 })
      .register('pipMode', PIPMode, { useVideoObserver: true, priority: 8 })
      .register('videoDuration', VideoDuration, { useVideoObserver: true, priority: 7 })
      .register('videoSeekbar', VideoSeekbar, { useVideoObserver: true, priority: 6 })
      .register('volumeSlider', VolumeSlider, { useVideoObserver: true, priority: 5 })
      .register('zenMode', ZenMode, { useVideoObserver: true, priority: 4 })
      .register('backgroundPlay', BackgroundPlay, { useVideoObserver: false, priority: 3 })
      .register('autoScroll', AutoScroll, { useVideoObserver: false, priority: 2 })
      .register('hideReels', HideReels, { useVideoObserver: false, priority: 1 })
      .register('hideExplore', HideExplore, { useVideoObserver: false, priority: 1 })
      .register('hideStories', HideStories, { useVideoObserver: false, priority: 1 })
      .register('hideSuggestedFollowers', HideSuggestedFollowers, { useVideoObserver: false, priority: 1 })
      .register('hideThreads', HideThreads, { useVideoObserver: false, priority: 1 });
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
