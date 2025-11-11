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
}
