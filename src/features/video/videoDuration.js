class VideoDuration extends BaseFeature {
  constructor() {
    super();
    this.durationElements = []; // Track all duration overlays for cleanup
    this.eventListeners = new WeakMap(); // Track event listeners per video
    this.observers = []; // Track all mutation observers for cleanup
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) {
      return '0:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const paddedMins = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
    const paddedSecs = String(secs).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${paddedMins}:${paddedSecs}`;
    }
    return `${paddedMins}:${paddedSecs}`;
  }

  createDurationOverlay() {
    const timeDisplay = this.createContainer('insta-video-duration-overlay');
    timeDisplay.textContent = '0:00 / 0:00';
    return timeDisplay;
  }

  updateTimeDisplay(timeDisplay, video) {
    const currentTime = this.formatTime(video.currentTime);
    const duration = this.formatTime(video.duration);
    timeDisplay.textContent = `${currentTime} / ${duration}`;
  }

  processVideo(video) {
    if (!video || this.isVideoTracked(video)) {
      return null;
    }

    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    this.ensureParentPositioned(videoParent);

    const timeDisplay = this.createDurationOverlay();

    // Position relative to PIP button
    this.positionRelativeToPIP(timeDisplay, videoParent);

    videoParent.appendChild(timeDisplay);

    // Track duration element for cleanup
    this.durationElements.push(timeDisplay);

    this.addToTrackedVideos(video, timeDisplay);

    const updateTime = () => this.updateTimeDisplay(timeDisplay, video);
    updateTime();

    // Store event listeners for cleanup
    const listeners = {
      timeupdate: updateTime,
      loadedmetadata: updateTime,
      durationchange: updateTime
    };
    this.eventListeners.set(video, listeners);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateTime);
    video.addEventListener('durationchange', updateTime);

    // Setup cleanup observer with callback to remove event listeners
    this.setupCleanupObserver(video, () => {
      const videoListeners = this.eventListeners.get(video);
      if (videoListeners) {
        video.removeEventListener('timeupdate', videoListeners.timeupdate);
        video.removeEventListener('loadedmetadata', videoListeners.loadedmetadata);
        video.removeEventListener('durationchange', videoListeners.durationchange);
        this.eventListeners.delete(video);
      }
    });

    return timeDisplay;
  }

  positionRelativeToPIP(timeDisplay, videoParent) {
    // Find PIP button in the same parent
    const pipButton = videoParent.querySelector('.insta-pip-button');

    if (pipButton) {
      const updatePosition = () => {
        requestAnimationFrame(() => {
          const pipLeft = parseInt(window.getComputedStyle(pipButton).left) || 12;
          const pipWidth = pipButton.offsetWidth;
          const gap = 8; // 8px gap

          // Position duration 8px to the right of PIP button
          timeDisplay.style.top = '12px';
          timeDisplay.style.left = `${pipLeft + pipWidth + gap}px`;
        });
      };

      // Initial position
      updatePosition();

      // Watch for PIP button changes
      const observer = new MutationObserver(updatePosition);
      observer.observe(pipButton, {
        attributes: true,
        attributeFilter: ['style']
      });

      // Track observer for cleanup
      this.observers.push(observer);

      // Cleanup when duration is removed
      const durationObserver = new MutationObserver(() => {
        if (!document.contains(timeDisplay)) {
          observer.disconnect();
          durationObserver.disconnect();
        }
      });

      durationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Track observer for cleanup
      this.observers.push(durationObserver);
    } else {
      // Fallback: PIP not found, try speed button
      const speedButton = videoParent.querySelector('.insta-speed-button');

      if (speedButton) {
        const updatePosition = () => {
          requestAnimationFrame(() => {
            const speedLeft = parseInt(window.getComputedStyle(speedButton).left) || 12;
            const speedWidth = speedButton.offsetWidth;
            const gap = 8;

            // Position duration 8px to the right of speed button
            timeDisplay.style.top = '12px';
            timeDisplay.style.left = `${speedLeft + speedWidth + gap}px`;
          });
        };

        updatePosition();

        const observer = new MutationObserver(updatePosition);
        observer.observe(speedButton, {
          childList: true,
          characterData: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style']
        });

        // Track observer for cleanup
        this.observers.push(observer);

        const durationObserver = new MutationObserver(() => {
          if (!document.contains(timeDisplay)) {
            observer.disconnect();
            durationObserver.disconnect();
          }
        });

        durationObserver.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Track observer for cleanup
        this.observers.push(durationObserver);
      } else {
        // Fallback: Both PIP and speed not found, try fullscreen
        const fullscreenButton = videoParent.querySelector('.insta-fullscreen-button');

        if (fullscreenButton) {
          const updatePosition = () => {
            requestAnimationFrame(() => {
              const fullscreenLeft = parseInt(window.getComputedStyle(fullscreenButton).left) || 12;
              const fullscreenWidth = fullscreenButton.offsetWidth;
              const gap = 8;

              // Position duration 8px to the right of fullscreen button
              timeDisplay.style.top = '12px';
              timeDisplay.style.left = `${fullscreenLeft + fullscreenWidth + gap}px`;
            });
          };

          updatePosition();

          const observer = new MutationObserver(updatePosition);
          observer.observe(fullscreenButton, {
            attributes: true,
            attributeFilter: ['style']
          });

          // Track observer for cleanup
          this.observers.push(observer);

          const durationObserver = new MutationObserver(() => {
            if (!document.contains(timeDisplay)) {
              observer.disconnect();
              durationObserver.disconnect();
            }
          });

          durationObserver.observe(document.body, {
            childList: true,
            subtree: true
          });

          // Track observer for cleanup
          this.observers.push(durationObserver);
        } else {
          // Fallback: None found - position at top-left
          timeDisplay.style.top = '12px';
          timeDisplay.style.left = '12px';
        }
      }
    }
  }

  /**
   * Override onCleanup to remove all duration overlays when feature is disabled
   */
  onCleanup() {
    // Remove all duration overlays from DOM
    this.durationElements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Clear the array
    this.durationElements = [];

    // Disconnect all mutation observers
    this.observers.forEach(observer => {
      if (observer) {
        observer.disconnect();
      }
    });

    // Clear observers array
    this.observers = [];

    // Remove event listeners from all tracked videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      const listeners = this.eventListeners.get(video);
      if (listeners) {
        video.removeEventListener('timeupdate', listeners.timeupdate);
        video.removeEventListener('loadedmetadata', listeners.loadedmetadata);
        video.removeEventListener('durationchange', listeners.durationchange);
        this.eventListeners.delete(video);
      }
    });
  }
}
