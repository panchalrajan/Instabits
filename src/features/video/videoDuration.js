class VideoDuration extends BaseFeature {
  constructor() {
    super();
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
    this.addToTrackedVideos(video, timeDisplay);

    const updateTime = () => this.updateTimeDisplay(timeDisplay, video);
    updateTime();

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateTime);
    video.addEventListener('durationchange', updateTime);

    this.setupCleanupObserver(video);

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
        } else {
          // Fallback: None found - position at top-left
          timeDisplay.style.top = '12px';
          timeDisplay.style.left = '12px';
        }
      }
    }
  }
}
