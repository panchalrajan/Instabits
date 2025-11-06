class BackgroundPlay {
  constructor() {
    this.trackedVideos = new WeakMap();
    this.enabled = true; // Always enabled
    this.init();
  }

  init() {
    // Override document visibility change behavior
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.enabled) {
        // Tab is hidden, but we want videos to keep playing
        this.keepAllVideosPlaying();
      }
    });

    // Monitor for focus changes
    window.addEventListener('blur', () => {
      if (this.enabled) {
        setTimeout(() => this.keepAllVideosPlaying(), 100);
      }
    });
  }

  keepAllVideosPlaying() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (video.paused && this.trackedVideos.has(video)) {
        const wasPlaying = this.trackedVideos.get(video);
        if (wasPlaying) {
          video.play().catch(() => {
            // Ignore errors (autoplay policy, etc)
          });
        }
      }
    });
  }

  addVideoTracking(video) {
    if (!video || this.trackedVideos.has(video)) {
      return;
    }

    // Track if video is playing
    let isPlaying = !video.paused;

    video.addEventListener('play', () => {
      isPlaying = true;
      this.trackedVideos.set(video, true);
    });

    video.addEventListener('pause', () => {
      // Detect if this is an auto-pause (tab switch) or user-initiated
      if (document.hidden || !document.hasFocus()) {
        // Tab is hidden/blurred, this is auto-pause
        // Try to resume after a short delay
        if (this.enabled) {
          setTimeout(() => {
            video.play().catch(() => {
              // Silence errors
            });
          }, 50);
        }
      } else {
        // User-initiated pause, respect it
        isPlaying = false;
        this.trackedVideos.set(video, false);
      }
    });

    // Store initial state
    this.trackedVideos.set(video, isPlaying);

    // Cleanup on video removal
    const observer = new MutationObserver(() => {
      if (!document.contains(video)) {
        this.trackedVideos.delete(video);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  processAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      this.addVideoTracking(video);
    });
  }
}
