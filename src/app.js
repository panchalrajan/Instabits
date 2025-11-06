// InstaBits - Main Application Entry Point

(function() {
  'use strict';

  // Initialize feature instances
  const videoDuration = new VideoDuration();
  const videoSeekbar = new VideoSeekbar();
  const volumeSlider = new VolumeSlider();

  /**
   * Process all videos on the page
   */
  function processVideos() {
    videoDuration.processAllVideos();
    videoSeekbar.processAllVideos();
    volumeSlider.processAllVideos();
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
