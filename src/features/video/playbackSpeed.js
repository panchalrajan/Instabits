class PlaybackSpeed extends BaseFeature {
  constructor() {
    super();
  }

  async initialize() {
    this.allVideos = new Set(); // Track all videos for bulk updates
    this.allSpeedOptions = [0.25, 0.5, 1.0, 1.25, 1.5, 2.0, 3.0];
    // Load enabled speeds from storage
    await this.loadEnabledSpeeds();
    // Always start at 1x on page load/reload
    this.currentSpeed = 1.0;

    // Listen for speed preference updates
    this.setupMessageListener();
  }

  async loadEnabledSpeeds() {
    try {
      const result = await chrome.storage.sync.get('pref_enabledPlaybackSpeeds');
      if (result.pref_enabledPlaybackSpeeds && Array.isArray(result.pref_enabledPlaybackSpeeds)) {
        this.speedOptions = result.pref_enabledPlaybackSpeeds;
      } else {
        // Default: all speeds enabled
        this.speedOptions = [...this.allSpeedOptions];
      }
    } catch (error) {
      console.error('Error loading enabled speeds:', error);
      this.speedOptions = [...this.allSpeedOptions];
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'updatePlaybackSpeeds' && message.speeds) {
        this.speedOptions = message.speeds;
        // Refresh all overlays with new speed options
        this.refreshAllOverlays();
      }
    });
  }

  refreshAllOverlays() {
    this.allVideos.forEach(video => {
      if (document.contains(video)) {
        const tracked = this.getTrackedData(video);
        if (tracked && tracked.overlay) {
          // Recreate overlay with new speed options
          const oldOverlay = tracked.overlay;
          const newOverlay = this.createSpeedOverlay();

          // Replace old overlay with new one
          oldOverlay.parentNode.replaceChild(newOverlay, oldOverlay);

          // Update tracked data
          tracked.overlay = newOverlay;

          // Reattach event listeners
          this.attachOverlayListeners(tracked.button, newOverlay, video);
        }
      } else {
        this.allVideos.delete(video);
      }
    });
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

  attachOverlayListeners(button, overlay, video) {
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
  }

  positionRelativeToFullscreen(button, overlay, videoParent) {
    // Find the fullscreen button in the same parent
    const fullscreenButton = videoParent.querySelector('.insta-fullscreen-button');

    if (fullscreenButton) {
      const updatePosition = () => {
        requestAnimationFrame(() => {
          const fullscreenLeft = parseInt(window.getComputedStyle(fullscreenButton).left) || 12;
          const fullscreenWidth = fullscreenButton.offsetWidth;
          const gap = 8; // 8px gap

          // Position speed button 8px to the right of fullscreen
          const leftPosition = fullscreenLeft + fullscreenWidth + gap;
          button.style.left = `${leftPosition}px`;
          overlay.style.left = `${leftPosition}px`;
        });
      };

      // Initial position
      updatePosition();

      // Watch for fullscreen button changes
      const observer = new MutationObserver(updatePosition);
      observer.observe(fullscreenButton, {
        attributes: true,
        attributeFilter: ['style']
      });

      // Cleanup when button is removed
      const cleanupObserver = new MutationObserver(() => {
        if (!document.contains(button)) {
          observer.disconnect();
          cleanupObserver.disconnect();
        }
      });

      cleanupObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      // Fallback: Fullscreen not found
      // Position at 12px from left edge
      button.style.left = '12px';
      overlay.style.left = '12px';
    }
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

    // Position speed button relative to fullscreen button
    this.positionRelativeToFullscreen(button, overlay, videoParent);

    this.addToTrackedVideos(video, { button, overlay });
    this.allVideos.add(video); // Track for bulk speed updates

    // Attach event listeners
    this.attachOverlayListeners(button, overlay, video);

    // Cleanup on video removal
    this.setupCleanupObserver(video, () => {
      this.allVideos.delete(video);
    });

    return { button, overlay };
  }
}
