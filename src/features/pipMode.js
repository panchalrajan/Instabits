class PIPMode {
  constructor() {
    this.trackedVideos = new WeakMap();
    this.currentPIPVideo = null;
  }

  isReelsFeed() {
    return window.location.pathname.includes('/reels/');
  }

  createButton() {
    const button = document.createElement('button');
    button.className = 'insta-pip-button';
    button.innerHTML = `
      <svg class="pip-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
        <rect x="12" y="10" width="8" height="5" rx="1" fill="currentColor"/>
      </svg>
    `;
    button.title = 'Picture-in-Picture';

    if (this.isReelsFeed()) {
      button.classList.add('reels-view');
    }

    return button;
  }

  async enterPIP(video, button) {
    // Check if PIP is supported
    if (!document.pictureInPictureEnabled || !video.requestPictureInPicture) {
      console.log('[InstaBits PiP] ⓘ PiP not supported by browser');
      return;
    }

    // If already in PIP, don't enter again
    if (document.pictureInPictureElement) {
      return;
    }

    try {
      await video.requestPictureInPicture();
      this.currentPIPVideo = video;
      button.classList.add('active');
      console.log('[InstaBits PiP] ✓ Successfully entered PiP mode');
    } catch (error) {
      console.log('[InstaBits PiP] ✗ Failed to enter PiP mode:', error.message);
      // Show user-friendly error if needed
      if (error.name === 'NotAllowedError') {
        console.log('[InstaBits PiP] ⓘ PiP requires user interaction');
      }
    }
  }

  async exitPIP(button) {
    if (!document.pictureInPictureElement) {
      return;
    }

    try {
      await document.exitPictureInPicture();
      this.currentPIPVideo = null;
      button.classList.remove('active');
      console.log('[InstaBits PiP] ✓ Exited PiP mode');
    } catch (error) {
      console.log('[InstaBits PiP] ✗ Failed to exit PiP mode:', error.message);
    }
  }

  addControlToVideo(video) {
    if (!video) return null;

    // Check if already tracked
    if (this.trackedVideos.has(video)) {
      return null;
    }

    const videoParent = video.parentElement;
    if (!videoParent) return null;

    // Ensure parent has position for absolute positioning
    const currentPosition = window.getComputedStyle(videoParent).position;
    if (currentPosition === 'static') {
      videoParent.style.position = 'relative';
    }

    const button = this.createButton();
    videoParent.appendChild(button);

    // Mark as tracked
    this.trackedVideos.set(video, { button });

    // Handle button click
    button.addEventListener('click', async (e) => {
      e.stopPropagation();

      if (document.pictureInPictureElement === video) {
        // Already in PIP, exit it
        await this.exitPIP(button);
      } else {
        // Enter PIP mode
        await this.enterPIP(video, button);
      }
    });

    // Listen for PIP events to update button state
    video.addEventListener('enterpictureinpicture', () => {
      button.classList.add('active');
      this.currentPIPVideo = video;
    });

    video.addEventListener('leavepictureinpicture', () => {
      button.classList.remove('active');
      if (this.currentPIPVideo === video) {
        this.currentPIPVideo = null;
      }
    });

    // Cleanup on video removal
    const observer = new MutationObserver(() => {
      if (!document.contains(video)) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return { button };
  }

  processAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      this.addControlToVideo(video);
    });
  }
}
