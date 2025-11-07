// InstaBits - Main Application Entry Point

(async function() {
  'use strict';

  // Feature instances (will be initialized based on settings)
  let videoDuration = null;
  let videoSeekbar = null;
  let volumeSlider = null;
  let playbackSpeed = null;
  let backgroundPlay = null;
  let autoScroll = null;

  /**
   * Initialize feature instances based on user settings
   */
  async function initializeFeatures() {
    videoDuration = await InstaBitsUtils.isFeatureEnabled('videoDuration') ? new VideoDuration() : null;
    videoSeekbar = await InstaBitsUtils.isFeatureEnabled('videoSeekbar') ? new VideoSeekbar() : null;
    volumeSlider = await InstaBitsUtils.isFeatureEnabled('volumeSlider') ? new VolumeSlider() : null;
    playbackSpeed = await InstaBitsUtils.isFeatureEnabled('playbackSpeed') ? new PlaybackSpeed() : null;
    backgroundPlay = await InstaBitsUtils.isFeatureEnabled('backgroundPlay') ? new BackgroundPlay() : null;
    autoScroll = await InstaBitsUtils.isFeatureEnabled('autoScroll') ? new AutoScroll() : null;
  }

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
  async function init() {
    await initializeFeatures();

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
