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
        // Navigated to reels page - wait for Instagram's SPA to load videos
        // Clear existing observed videos
        this.observedVideos.clear();

        // Set up mutation observer first to catch videos as they're added
        this.setupMutationObserver();

        // Wait for videos to load, then observe them
        this.waitForVideosAndObserve();
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

  /**
   * Wait for videos to appear in DOM after navigation, then observe them
   * Uses polling with timeout to handle Instagram's SPA loading
   */
  waitForVideosAndObserve() {
    let attempts = 0;
    const maxAttempts = 20; // Try for up to 2 seconds
    const interval = 100; // Check every 100ms

    const tryObserve = () => {
      const videos = document.querySelectorAll(this.VIDEOS_LIST_SELECTOR);

      if (videos.length > 0) {
        // Videos found, observe them
        this.observeAllVideos();
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        // Keep trying
        setTimeout(tryObserve, interval);
      } else {
        // Give up after max attempts
        console.log('[AutoScroll] Timed out waiting for videos after navigation');
      }
    };

    // Start trying immediately
    tryObserve();
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

    // Disconnect existing observer if any
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    // Create new observer
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
