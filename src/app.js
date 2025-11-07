// InstaBits - Main Application Entry Point

(function() {
  'use strict';

  // Initialize feature instances only if enabled
  const videoDuration = InstaBitsUtils.isFeatureEnabled('videoDuration') ? new VideoDuration() : null;
  const videoSeekbar = InstaBitsUtils.isFeatureEnabled('videoSeekbar') ? new VideoSeekbar() : null;
  const volumeSlider = InstaBitsUtils.isFeatureEnabled('volumeSlider') ? new VolumeSlider() : null;
  const playbackSpeed = InstaBitsUtils.isFeatureEnabled('playbackSpeed') ? new PlaybackSpeed() : null;
  const backgroundPlay = InstaBitsUtils.isFeatureEnabled('backgroundPlay') ? new BackgroundPlay() : null;
  const autoScroll = InstaBitsUtils.isFeatureEnabled('autoScroll') ? new AutoScroll() : null;

  /**
   * Process all videos on the page
   */
  function processVideos() {
    if (videoDuration) videoDuration.processAllVideos();
    if (videoSeekbar) videoSeekbar.processAllVideos();
    if (volumeSlider) volumeSlider.processAllVideos();
    if (playbackSpeed) playbackSpeed.processAllVideos();
    if (backgroundPlay) backgroundPlay.processAllVideos();
    if (autoScroll) autoScroll.processAllVideos();
  }

  /**
   * Initialize the extension
   */
  function init() {
    console.log('InstaBits initialized');

    // Initial scan
    processVideos();

    // Periodically scan for new videos (Instagram loads content dynamically)
    setInterval(processVideos, 2000);

    // Observe DOM changes for more responsive detection
    const observer = new MutationObserver(() => {
      setTimeout(processVideos, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
