class VideoDuration extends BaseFeature {
  constructor() {
    super();
    this.durationElements = []; // Track all duration overlays for cleanup
    this.eventListeners = new WeakMap(); // Track event listeners per video
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

    // Register with VideoControlsManager for unified layout
    videoControlsManager.registerElement(video, 'videoDuration', timeDisplay);

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
      videoControlsManager.unregisterElement(video, 'videoDuration');
    });

    return timeDisplay;
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
