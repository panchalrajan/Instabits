class FullScreen extends BaseFeature {
  constructor() {
    super();
    this.fullscreenButtons = []; // Track all fullscreen buttons for cleanup
  }

  createFullScreenButton() {
    const button = this.createButton(
      'insta-fullscreen-button',
      `<svg class="fullscreen-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      'Full Screen'
    );
    return button;
  }

  async enterFullScreen(video) {
    if (!video) return;

    try {
      // Check if fullscreen is available
      if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) {
        console.warn('Fullscreen not supported');
        return;
      }

      // Request fullscreen on the video element
      if (video.requestFullscreen) {
        await video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        await video.webkitRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        await video.mozRequestFullScreen();
      } else if (video.msRequestFullscreen) {
        await video.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }

  processVideo(video) {
    if (!video || this.isVideoTracked(video)) {
      return null;
    }

    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    this.ensureParentPositioned(videoParent);

    const button = this.createFullScreenButton();

    // Register with VideoControlsManager for unified layout
    videoControlsManager.registerElement(video, 'fullscreen', button);

    // Track fullscreen button for cleanup
    this.fullscreenButtons.push(button);

    this.addToTrackedVideos(video, { button });

    // Click handler
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.enterFullScreen(video);
    });

    // Cleanup on video removal
    this.setupCleanupObserver(video, () => {
      videoControlsManager.unregisterElement(video, 'fullscreen');
    });

    return { button };
  }

  /**
   * Override onCleanup to remove all fullscreen buttons and exit fullscreen when feature is disabled
   */
  async onCleanup() {
    // Exit fullscreen mode if active
    const fullscreenElement = document.fullscreenElement ||
                             document.webkitFullscreenElement ||
                             document.mozFullScreenElement ||
                             document.msFullscreenElement;

    if (fullscreenElement) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      } catch (error) {
        // Ignore errors when exiting fullscreen
      }
    }

    // Remove all fullscreen buttons from DOM
    this.fullscreenButtons.forEach(button => {
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    });

    // Clear the array
    this.fullscreenButtons = [];
  }
}
