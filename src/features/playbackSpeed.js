class PlaybackSpeed extends BaseFeature {
  constructor() {
    super();
  }

  initialize() {
    this.allVideos = new Set(); // Track all videos for bulk updates
    this.speedOptions = [0.25, 0.5, 1.0, 1.25, 1.5, 2.0, 3.0];
    // Always start at 1x on page load/reload
    this.currentSpeed = 1.0;
  }

  saveSpeed(speed) {
    // Save in memory for current session only
    this.currentSpeed = speed;
  }

  formatSpeed(speed) {
    return speed === 1.0 ? '1x' : `${speed}x`;
  }

  createSpeedButton() {
    const button = this.createButton(
      'insta-speed-button',
      this.formatSpeed(this.currentSpeed),
      'Playback Speed'
    );
    return button;
  }

  createSpeedOverlay() {
    const overlay = this.createContainer('insta-speed-overlay');

    this.speedOptions.forEach(speed => {
      const option = document.createElement('div');
      option.className = 'insta-speed-option';
      option.textContent = this.formatSpeed(speed);
      option.dataset.speed = speed;

      if (speed === this.currentSpeed) {
        option.classList.add('selected');
      }

      overlay.appendChild(option);
    });

    return overlay;
  }

  updateButton(button, speed) {
    button.textContent = this.formatSpeed(speed);
  }

  updateOverlay(overlay, speed) {
    overlay.querySelectorAll('.insta-speed-option').forEach(option => {
      const optionSpeed = parseFloat(option.dataset.speed);
      if (optionSpeed === speed) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  setSpeed(video, speed, button, overlay) {
    // Update current speed
    this.saveSpeed(speed);

    // Apply to ALL tracked videos, not just the current one
    this.allVideos.forEach(vid => {
      if (document.contains(vid)) {
        vid.playbackRate = speed;
      } else {
        // Remove dead videos
        this.allVideos.delete(vid);
      }
    });

    // Update all buttons and overlays
    this.allVideos.forEach(vid => {
      const tracked = this.getTrackedData(vid);
      if (tracked) {
        this.updateButton(tracked.button, speed);
        this.updateOverlay(tracked.overlay, speed);
      }
    });
  }

  processVideo(video) {
    if (!video) return null;

    // Always apply current speed, even if already tracked
    video.playbackRate = this.currentSpeed;

    if (this.isVideoTracked(video)) {
      return null;
    }

    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    this.ensureParentPositioned(videoParent);

    const button = this.createSpeedButton();
    const overlay = this.createSpeedOverlay();

    videoParent.appendChild(button);
    videoParent.appendChild(overlay);

    this.addToTrackedVideos(video, { button, overlay });
    this.allVideos.add(video); // Track for bulk speed updates

    let hideTimeout = null;

    const showOverlay = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      overlay.classList.add('visible');
    };

    const hideOverlay = () => {
      hideTimeout = setTimeout(() => {
        overlay.classList.remove('visible');
      }, 300);
    };

    button.addEventListener('mouseenter', showOverlay);
    button.addEventListener('mouseleave', hideOverlay);

    overlay.addEventListener('mouseenter', showOverlay);
    overlay.addEventListener('mouseleave', hideOverlay);

    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target.classList.contains('insta-speed-option')) {
        const speed = parseFloat(e.target.dataset.speed);
        this.setSpeed(video, speed, button, overlay);
        hideOverlay();
      }
    });

    // Cleanup on video removal
    this.setupCleanupObserver(video, () => {
      this.allVideos.delete(video);
    });

    return { button, overlay };
  }
}
