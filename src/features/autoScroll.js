class AutoScroll {
  constructor() {
    this.enabled = true;
    this.VIDEOS_LIST_SELECTOR = "main video";
    this.intervalId = null;
    this.init();
  }

  init() {
    // Bind the event handler once
    this.boundEndVideoEvent = this.endVideoEvent.bind(this);

    // Set up interval to periodically check and update current video
    this.intervalId = setInterval(() => {
      this.processAllVideos();
    }, 2000);
  }

  isReelsPage() {
    return window.location.pathname.includes('/reels/');
  }

  getCurrentVideo() {
    return Array.from(document.querySelectorAll(this.VIDEOS_LIST_SELECTOR)).find((video) => {
      const videoRect = video.getBoundingClientRect();
      const isVideoInView =
        videoRect.top >= 0 &&
        videoRect.left >= 0 &&
        videoRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        videoRect.right <= (window.innerWidth || document.documentElement.clientWidth);
      return isVideoInView;
    });
  }

  endVideoEvent() {
    if (!this.enabled) return;

    const VIDEOS_LIST = Array.from(document.querySelectorAll(this.VIDEOS_LIST_SELECTOR));
    const currentVideo = this.getCurrentVideo();

    if (!currentVideo) return;

    const index = VIDEOS_LIST.findIndex((vid) => vid.src && vid.src === currentVideo.src);
    const nextVideo = VIDEOS_LIST[index + 1];

    if (nextVideo) {
      nextVideo.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "center"
      });
    }
  }

  addVideoEndEvent() {
    if (!this.enabled || !this.isReelsPage()) return;

    const currentVideo = this.getCurrentVideo();
    if (!currentVideo) return;

    // Remove loop attribute
    currentVideo.removeAttribute("loop");

    // Remove old listener and add new one
    currentVideo.removeEventListener("ended", this.boundEndVideoEvent);
    currentVideo.addEventListener("ended", this.boundEndVideoEvent);
  }

  processAllVideos() {
    if (!this.isReelsPage()) return;
    this.addVideoEndEvent();
  }

  cleanup() {
    // Clear interval when feature is disabled
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Remove event listener from current video
    const currentVideo = this.getCurrentVideo();
    if (currentVideo) {
      currentVideo.removeEventListener("ended", this.boundEndVideoEvent);
    }
  }
}
