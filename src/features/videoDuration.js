class VideoDuration {
  constructor() {
    this.trackedVideos = new WeakMap();
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

  create() {
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'insta-video-duration-overlay';
    timeDisplay.textContent = '0:00 / 0:00';
    return timeDisplay;
  }

  updateTimeDisplay(timeDisplay, video) {
    const currentTime = this.formatTime(video.currentTime);
    const duration = this.formatTime(video.duration);
    timeDisplay.textContent = `${currentTime} / ${duration}`;
  }

  addOverlayToVideo(video) {
    if (!video || this.trackedVideos.has(video)) {
      return null;
    }

    const videoParent = video.parentElement;
    if (!videoParent) return null;

    const currentPosition = window.getComputedStyle(videoParent).position;
    if (currentPosition === 'static') {
      videoParent.style.position = 'relative';
    }

    const timeDisplay = this.create();
    videoParent.appendChild(timeDisplay);
    this.trackedVideos.set(video, timeDisplay);
    const updateTime = () => this.updateTimeDisplay(timeDisplay, video);
    updateTime();

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateTime);
    video.addEventListener('durationchange', updateTime);

    return timeDisplay;
  }

  processAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      this.addOverlayToVideo(video);
    });
  }
}
