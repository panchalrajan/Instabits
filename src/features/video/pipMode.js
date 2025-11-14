class PIPMode extends BaseFeature {
  constructor() {
    super();
  }

  initialize() {
    this.currentPIPVideo = null;
    this.isInPIPMode = false;
    this.setupVideoSwitching();
  }

  createPIPButton() {
    const button = this.createButton(
      'insta-pip-button',
      `<svg class="pip-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
        <rect x="12" y="10" width="8" height="5" rx="1" fill="currentColor"/>
      </svg>`,
      'Picture-in-Picture'
    );
    return button;
  }

  findActiveVideo() {
    const videos = Array.from(document.querySelectorAll('video'))
      .filter(video => video.readyState !== 0)
      .filter(video => video.disablePictureInPicture === false);

    if (videos.length === 0) {
      return null;
    }

    // Prioritize actively playing videos
    const playingVideos = videos.filter(v => !v.paused && !v.muted);
    if (playingVideos.length > 0) {
      return playingVideos.sort((v1, v2) => {
        const v1Rect = v1.getBoundingClientRect();
        const v2Rect = v2.getBoundingClientRect();
        return (v2Rect.width * v2Rect.height) - (v1Rect.width * v1Rect.height);
      })[0];
    }

    // Find most visible video
    let mostVisibleVideo = null;
    let maxVisibility = 0;

    for (const video of videos) {
      const visibility = this.calculateVisibility(video);
      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        mostVisibleVideo = video;
      }
    }

    return mostVisibleVideo;
  }

  calculateVisibility(video) {
    const rect = video.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    if (rect.bottom < 0 || rect.top > viewportHeight ||
        rect.right < 0 || rect.left > viewportWidth) {
      return 0;
    }

    const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.height * rect.width;

    return totalArea > 0 ? visibleArea / totalArea : 0;
  }

  setupVideoSwitching() {
    // Monitor play events for auto-switching
    document.addEventListener('play', async (e) => {
      if (!this.isInPIPMode || !this.isReelsFeed()) {
        return;
      }

      const newVideo = e.target;
      if (newVideo !== this.currentPIPVideo && newVideo.tagName === 'VIDEO') {
        await this.switchPIPVideo(newVideo);
      }
    }, true);

    // Monitor scroll for video changes
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!this.isInPIPMode || !this.isReelsFeed()) {
        return;
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(async () => {
        const activeVideo = this.findActiveVideo();
        if (activeVideo && activeVideo !== this.currentPIPVideo) {
          await this.switchPIPVideo(activeVideo);
        }
      }, 300);
    }, { passive: true });
  }

  async switchPIPVideo(newVideo) {
    if (!newVideo || newVideo === this.currentPIPVideo) {
      return;
    }

    // Wait for video to be ready
    if (newVideo.readyState === 0) {
      await new Promise((resolve) => {
        const checkReady = () => {
          if (newVideo.readyState >= 2) {
            resolve();
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
      });
    }

    try {
      await newVideo.requestPictureInPicture();
      this.currentPIPVideo = newVideo;
      this.updateAllButtonStates();
    } catch (error) {
      this.isInPIPMode = false;
      this.currentPIPVideo = null;
      this.updateAllButtonStates();
    }
  }

  updateAllButtonStates() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      const tracked = this.getTrackedData(video);
      if (tracked && tracked.button) {
        if (video === this.currentPIPVideo && this.isInPIPMode) {
          tracked.button.classList.add('active');
        } else {
          tracked.button.classList.remove('active');
        }
      }
    });
  }

  async enterPIP(video, button) {
    if (!document.pictureInPictureEnabled || !video.requestPictureInPicture) {
      return;
    }

    if (document.pictureInPictureElement === video) {
      return;
    }

    // Switch to new video if already in PIP
    if (document.pictureInPictureElement) {
      await this.switchPIPVideo(video);
      return;
    }

    try {
      video.disablePictureInPicture = false;
      await video.requestPictureInPicture();
      this.currentPIPVideo = video;
      this.isInPIPMode = true;
      button.classList.add('active');
    } catch (error) {
      if (error.name === 'NotAllowedError') {
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
      this.isInPIPMode = false;
      button.classList.remove('active');
      this.updateAllButtonStates();
    } catch (error) {
    }
  }

  repositionDuration(videoParent) {
    // After PIP button is added, reposition Duration if it exists
    requestAnimationFrame(() => {
      const durationOverlay = videoParent.querySelector('.insta-video-duration-overlay');
      const pipButton = videoParent.querySelector('.insta-pip-button');
      if (durationOverlay && pipButton) {
        const pipLeft = parseInt(window.getComputedStyle(pipButton).left) || 12;
        const pipWidth = pipButton.offsetWidth;
        const gap = 8;
        durationOverlay.style.left = `${pipLeft + pipWidth + gap}px`;
      }
    });
  }

  positionRelativeToSpeedButton(pipButton, videoParent) {
    // Find the speed button in the same parent
    const speedButton = videoParent.querySelector('.insta-speed-button');

    if (speedButton) {
      const updatePosition = () => {
        requestAnimationFrame(() => {
          const speedLeft = parseInt(window.getComputedStyle(speedButton).left) || 12;
          const speedWidth = speedButton.offsetWidth;
          const gap = 8; // 8px gap

          // Position PIP button 8px to the right of speed button
          pipButton.style.left = `${speedLeft + speedWidth + gap}px`;

          // After positioning PIP, reposition Duration if it exists
          this.repositionDuration(videoParent);
        });
      };

      // Initial position
      updatePosition();

      // Watch for speed button changes
      const observer = new MutationObserver(updatePosition);
      observer.observe(speedButton, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });

      // Cleanup when PIP button is removed
      const pipObserver = new MutationObserver(() => {
        if (!document.contains(pipButton)) {
          observer.disconnect();
          pipObserver.disconnect();
        }
      });

      pipObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      // Fallback: Speed not found, try to position relative to duration
      const durationOverlay = videoParent.querySelector('.insta-video-duration-overlay');

      if (durationOverlay) {
        const updatePosition = () => {
          requestAnimationFrame(() => {
            const durationLeft = parseInt(window.getComputedStyle(durationOverlay).left) || 12;
            const durationWidth = durationOverlay.offsetWidth;
            const gap = 8;

            // Position PIP button 8px to the right of duration
            pipButton.style.left = `${durationLeft + durationWidth + gap}px`;
          });
        };

        updatePosition();

        const observer = new MutationObserver(updatePosition);
        observer.observe(durationOverlay, {
          attributes: true,
          attributeFilter: ['style']
        });

        const pipObserver = new MutationObserver(() => {
          if (!document.contains(pipButton)) {
            observer.disconnect();
            pipObserver.disconnect();
          }
        });

        pipObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        // Fallback: Both speed and duration not found, try fullscreen
        const fullscreenButton = videoParent.querySelector('.insta-fullscreen-button');

        if (fullscreenButton) {
          const updatePosition = () => {
            requestAnimationFrame(() => {
              const fullscreenLeft = parseInt(window.getComputedStyle(fullscreenButton).left) || 12;
              const fullscreenWidth = fullscreenButton.offsetWidth;
              const gap = 8;

              // Position PIP button 8px to the right of fullscreen
              pipButton.style.left = `${fullscreenLeft + fullscreenWidth + gap}px`;

              // After positioning PIP, reposition Duration if it exists
              this.repositionDuration(videoParent);
            });
          };

          updatePosition();

          const observer = new MutationObserver(updatePosition);
          observer.observe(fullscreenButton, {
            attributes: true,
            attributeFilter: ['style']
          });

          const pipObserver = new MutationObserver(() => {
            if (!document.contains(pipButton)) {
              observer.disconnect();
              pipObserver.disconnect();
            }
          });

          pipObserver.observe(document.body, {
            childList: true,
            subtree: true
          });
        } else {
          // Fallback: None found - position at 12px from leading edge
          pipButton.style.left = '12px';
          // Still try to reposition duration
          this.repositionDuration(videoParent);
        }
      }
    }
  }

  processVideo(video) {
    if (!video) return null;

    if (!this.isReelsFeed()) {
      return null;
    }

    if (this.isVideoTracked(video)) {
      return null;
    }

    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    this.ensureParentPositioned(videoParent);

    const button = this.createPIPButton();
    videoParent.appendChild(button);

    // Position PIP button relative to speed button
    this.positionRelativeToSpeedButton(button, videoParent);

    this.addToTrackedVideos(video, { button });

    button.addEventListener('click', async (e) => {
      e.stopPropagation();

      if (document.pictureInPictureElement === video) {
        await this.exitPIP(button);
      } else if (document.pictureInPictureElement) {
        await this.switchPIPVideo(video);
      } else {
        await this.enterPIP(video, button);
      }
    });

    video.addEventListener('enterpictureinpicture', () => {
      button.classList.add('active');
      this.currentPIPVideo = video;
      this.isInPIPMode = true;
    });

    video.addEventListener('leavepictureinpicture', () => {
      button.classList.remove('active');
      if (this.currentPIPVideo === video) {
        this.currentPIPVideo = null;
        this.isInPIPMode = false;
      }
    });

    // Cleanup on video removal
    this.setupCleanupObserver(video);

    return { button };
  }
}
