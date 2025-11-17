class AutoScroll {
  constructor() {
    this.enabled = true;
    this.VIDEOS_LIST_SELECTOR = "main video";
    this.currentVideo = null;
    this.observedVideos = new Set();
    this.intersectionObserver = null;
    this.mutationObserver = null;
    this.navigationUnsubscribe = null;
    this.init();
  }

  init() {
    // Bind the event handler once
    this.boundEndVideoEvent = this.endVideoEvent.bind(this);

    // Set up IntersectionObserver for efficient viewport detection
    this.setupIntersectionObserver();

    // Observe existing videos
    this.observeAllVideos();

    // Watch for new videos being added to DOM
    this.setupMutationObserver();

    // Listen for navigation changes to reinitialize on reels pages
    this.setupNavigationListener();
  }

  setupNavigationListener() {
    this.navigationUnsubscribe = navigationTracker.onNavigate((newState, previousState) => {
      // Reinitialize observers when navigating to/from reels pages
      const wasReelsPage = previousState.pathname.includes('/reels/');
      const isReelsPage = newState.pathname.includes('/reels/');

      if (!wasReelsPage && isReelsPage) {
        // Navigated to reels page - set up observers
        this.setupMutationObserver();
        this.observeAllVideos();
      } else if (wasReelsPage && !isReelsPage) {
        // Navigated away from reels page - clean up observers
        if (this.mutationObserver) {
          this.mutationObserver.disconnect();
          this.mutationObserver = null;
        }
        this.observedVideos.clear();
      }
    });
  }

  setupIntersectionObserver() {
    // A video is considered "current" if more than 50% is visible
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // This video is now the current one
            this.setCurrentVideo(video);
          }
        });
      },
      {
        threshold: [0, 0.5, 1.0], // Trigger at 0%, 50%, and 100% visibility
        rootMargin: '0px'
      }
    );
  }

  setupMutationObserver() {
    if (!this.isReelsPage()) return;

    this.mutationObserver = new MutationObserver(() => {
      this.observeAllVideos();
    });

    const mainElement = document.querySelector('main');
    if (mainElement) {
      this.mutationObserver.observe(mainElement, {
        childList: true,
        subtree: true
      });
    }
  }

  observeAllVideos() {
    if (!this.isReelsPage()) return;

    const videos = document.querySelectorAll(this.VIDEOS_LIST_SELECTOR);
    videos.forEach((video) => {
      if (!this.observedVideos.has(video)) {
        this.intersectionObserver.observe(video);
        this.observedVideos.add(video);
      }
    });
  }

  setCurrentVideo(video) {
    // Remove listener from previous video
    if (this.currentVideo && this.currentVideo !== video) {
      this.currentVideo.removeEventListener("ended", this.boundEndVideoEvent);
    }

    this.currentVideo = video;

    if (!this.enabled || !this.isReelsPage()) return;

    // Remove loop attribute so video ends naturally
    video.removeAttribute("loop");

    // Add ended event listener
    video.removeEventListener("ended", this.boundEndVideoEvent);
    video.addEventListener("ended", this.boundEndVideoEvent);
  }

  isReelsPage() {
    return navigationTracker.isReelsPage();
  }

  endVideoEvent() {
    if (!this.enabled || !this.currentVideo) return;

    const VIDEOS_LIST = Array.from(document.querySelectorAll(this.VIDEOS_LIST_SELECTOR));
    const index = VIDEOS_LIST.findIndex((vid) => vid.src && vid.src === this.currentVideo.src);
    const nextVideo = VIDEOS_LIST[index + 1];

    if (nextVideo) {
      nextVideo.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "center"
      });
    }
  }

  processAllVideos() {
    // This method is called by BaseFeature pattern, but we handle videos via observers
    if (!this.isReelsPage()) return;
    this.observeAllVideos();
  }

  cleanup() {
    // Unsubscribe from navigation changes
    if (this.navigationUnsubscribe) {
      this.navigationUnsubscribe();
      this.navigationUnsubscribe = null;
    }

    // Disconnect IntersectionObserver
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    // Disconnect MutationObserver
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Remove event listener from current video
    if (this.currentVideo) {
      this.currentVideo.removeEventListener("ended", this.boundEndVideoEvent);
      this.currentVideo = null;
    }

    // Clear observed videos set
    this.observedVideos.clear();
  }
}
