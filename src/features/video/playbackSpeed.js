class PlaybackSpeed extends BaseFeature {
  constructor() {
    super();
    // Initialize with default values immediately to prevent undefined errors
    this.allSpeedOptions = [0.25, 0.5, 1.0, 1.25, 1.5, 2.0, 3.0];
    this.speedOptions = [...this.allSpeedOptions]; // Default: all speeds enabled
    this.currentSpeed = 1.0;
    this.allVideos = new Set();
  }

  async initialize() {
    // Load enabled speeds from storage (will override defaults)
    await this.loadEnabledSpeeds();

    // Load last used speed from storage
    await this.loadCurrentSpeed();

    // Listen for speed preference updates
    this.setupMessageListener();
  }

  async loadEnabledSpeeds() {
    try {
      const result = await storageService.getUserPreference('enabledPlaybackSpeeds', this.allSpeedOptions);
      if (result && Array.isArray(result)) {
        this.speedOptions = result;
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

  async loadCurrentSpeed() {
    try {
      const savedSpeed = await storageService.getUserPreference('currentPlaybackSpeed', 1.0);
      if (Number.isFinite(savedSpeed) && savedSpeed > 0) {
        this.currentSpeed = savedSpeed;
      }
    } catch (error) {
      console.error('Error loading current speed:', error);
      this.currentSpeed = 1.0;
    }
  }

  async saveSpeed(speed) {
    // Save to memory
    this.currentSpeed = speed;

    // Persist to storage
    try {
      await storageService.setUserPreference('currentPlaybackSpeed', speed);
    } catch (error) {
      console.error('Error saving current speed:', error);
    }
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
    // Validate speed is a finite number
    if (!Number.isFinite(speed) || speed <= 0) {
      console.error('PlaybackSpeed: Invalid speed value:', speed);
      return;
    }

    // Update current speed
    this.saveSpeed(speed);

    // Apply to ALL tracked videos, not just the current one
    this.allVideos.forEach(vid => {
      if (document.contains(vid)) {
        try {
          vid.playbackRate = speed;
        } catch (error) {
          console.error('PlaybackSpeed: Error setting playbackRate:', error);
        }
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
        // Validate parsed speed
        if (Number.isFinite(speed) && speed > 0) {
          this.setSpeed(video, speed, button, overlay);
          hideOverlay();
        } else {
          console.error('PlaybackSpeed: Invalid speed from dataset:', e.target.dataset.speed);
        }
      }
    });
  }

  repositionDownstreamButtons(videoParent) {
    // After speed button is added, reposition PIP and Duration if they exist
    requestAnimationFrame(() => {
      const pipButton = videoParent.querySelector('.insta-pip-button');
      if (pipButton) {
        // Trigger PIP to reposition relative to speed
        const speedButton = videoParent.querySelector('.insta-speed-button');
        if (speedButton) {
          const speedLeft = parseInt(window.getComputedStyle(speedButton).left) || 12;
          const speedWidth = speedButton.offsetWidth;
          const gap = 8;
          pipButton.style.left = `${speedLeft + speedWidth + gap}px`;
        }
      }

      const durationOverlay = videoParent.querySelector('.insta-video-duration-overlay');
      if (durationOverlay && !pipButton) {
        // Duration exists but PIP doesn't - reposition duration relative to speed
        const speedButton = videoParent.querySelector('.insta-speed-button');
        if (speedButton) {
          const speedLeft = parseInt(window.getComputedStyle(speedButton).left) || 12;
          const speedWidth = speedButton.offsetWidth;
          const gap = 8;
          durationOverlay.style.left = `${speedLeft + speedWidth + gap}px`;
        }
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

          // After positioning speed, reposition downstream buttons
          this.repositionDownstreamButtons(videoParent);
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
    // Validate speed before applying
    if (Number.isFinite(this.currentSpeed) && this.currentSpeed > 0) {
      try {
        video.playbackRate = this.currentSpeed;
      } catch (error) {
        console.error('PlaybackSpeed: Error setting initial playbackRate:', error);
      }
    }

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

  onCleanup() {
    // Store video parents before cleanup for repositioning downstream buttons
    const videoParents = new Set();

    // Remove all buttons and overlays from tracked videos
    // Use allVideos Set since WeakMap cannot be iterated
    this.allVideos.forEach(video => {
      const trackedData = this.getTrackedData(video);
      if (trackedData) {
        // Store parent for later repositioning
        const videoParent = this.getVideoParent(video);
        if (videoParent) {
          videoParents.add(videoParent);
        }

        // Remove button
        if (trackedData.button && trackedData.button.parentNode) {
          trackedData.button.remove();
        }
        // Remove overlay
        if (trackedData.overlay && trackedData.overlay.parentNode) {
          trackedData.overlay.remove();
        }
      }

      // Reset video speed
      try {
        video.playbackRate = 1.0;
      } catch (error) {
        console.error('PlaybackSpeed: Error resetting playbackRate:', error);
      }
    });

    // After removing speed buttons, reposition PIP and Duration to fill the gap
    requestAnimationFrame(() => {
      videoParents.forEach(videoParent => {
        this.repositionDownstreamButtonsAfterRemoval(videoParent);
      });
    });

    // Clear all videos set
    this.allVideos.clear();

    // Also reset any other videos on the page that might have modified speed
    const allPageVideos = document.querySelectorAll('video');
    allPageVideos.forEach(video => {
      try {
        if (video.playbackRate !== 1.0) {
          video.playbackRate = 1.0;
        }
      } catch (error) {
        // Ignore errors for videos that don't support playbackRate
      }
    });
  }

  repositionDownstreamButtonsAfterRemoval(videoParent) {
    // When speed button is removed, reposition PIP and Duration to fill the gap
    const pipButton = videoParent.querySelector('.insta-pip-button');
    const durationOverlay = videoParent.querySelector('.insta-video-duration-overlay');
    const fullscreenButton = videoParent.querySelector('.insta-fullscreen-button');

    if (pipButton) {
      // PIP should now position relative to fullscreen (since speed is gone)
      if (fullscreenButton) {
        const fullscreenLeft = parseInt(window.getComputedStyle(fullscreenButton).left) || 12;
        const fullscreenWidth = fullscreenButton.offsetWidth;
        const gap = 8;
        pipButton.style.left = `${fullscreenLeft + fullscreenWidth + gap}px`;
      } else {
        pipButton.style.left = '12px';
      }
    }

    if (durationOverlay) {
      // Duration should reposition relative to PIP or fullscreen (since speed is gone)
      if (pipButton) {
        const pipLeft = parseInt(window.getComputedStyle(pipButton).left) || 12;
        const pipWidth = pipButton.offsetWidth;
        const gap = 8;
        durationOverlay.style.left = `${pipLeft + pipWidth + gap}px`;
      } else if (fullscreenButton) {
        const fullscreenLeft = parseInt(window.getComputedStyle(fullscreenButton).left) || 12;
        const fullscreenWidth = fullscreenButton.offsetWidth;
        const gap = 8;
        durationOverlay.style.left = `${fullscreenLeft + fullscreenWidth + gap}px`;
      } else {
        durationOverlay.style.left = '12px';
      }
    }
  }
}
