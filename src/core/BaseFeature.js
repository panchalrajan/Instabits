/**
 * BaseFeature - Abstract base class for InstaBits features
 *
 * Provides common functionality for all feature implementations:
 * - Video tracking with WeakMap
 * - DOM mutation observation for cleanup
 * - Parent element positioning
 * - Common utility methods
 * - Standardized lifecycle hooks
 *
 * Features extending this class should implement:
 * - processVideo(video) - Process a single video element
 */
class BaseFeature {
  constructor() {
    if (new.target === BaseFeature) {
      throw new TypeError("Cannot construct BaseFeature instances directly. Must extend BaseFeature.");
    }

    // Common properties all features need
    this.trackedVideos = new WeakMap();
    this.videoCleanupCallbacks = new WeakMap();
    this.featureName = this.constructor.name;
    this.sharedMutationObserver = null;

    // Initialize the feature
    this.initialize();
  }

  /**
   * Initialize the feature
   * Override this in subclasses for custom initialization
   */
  initialize() {
    // Subclasses can override
  }

  /**
   * Check if current page is the reels feed (/reels/)
   * @returns {boolean}
   */
  isReelsFeed() {
    return window.location.pathname.includes('/reels/');
  }

  /**
   * Check if current page is a single reel (/reel/)
   * @returns {boolean}
   */
  isSingleReel() {
    return window.location.pathname.includes('/reel/');
  }

  /**
   * Check if video is already tracked
   * @param {HTMLVideoElement} video
   * @returns {boolean}
   */
  isVideoTracked(video) {
    return this.trackedVideos.has(video);
  }

  /**
   * Get tracked data for a video
   * @param {HTMLVideoElement} video
   * @returns {*}
   */
  getTrackedData(video) {
    return this.trackedVideos.get(video);
  }

  /**
   * Add video to tracked videos
   * @param {HTMLVideoElement} video
   * @param {*} data - Data to associate with this video
   */
  addToTrackedVideos(video, data) {
    this.trackedVideos.set(video, data);
  }

  /**
   * Remove video from tracked videos
   * @param {HTMLVideoElement} video
   */
  removeFromTrackedVideos(video) {
    this.trackedVideos.delete(video);
  }

  /**
   * Ensure video parent has position: relative
   * Required for absolute positioning of controls
   * @param {HTMLElement} parent
   */
  ensureParentPositioned(parent) {
    if (!parent) return;

    const currentPosition = window.getComputedStyle(parent).position;
    if (currentPosition === 'static') {
      parent.style.position = 'relative';
    }
  }

  /**
   * Get video parent element
   * @param {HTMLVideoElement} video
   * @returns {HTMLElement|null}
   */
  getVideoParent(video) {
    return video ? video.parentElement : null;
  }

  /**
   * Set up cleanup observer for a video
   * Automatically cleans up when video is removed from DOM
   * Uses a single shared MutationObserver for all videos in this feature instance
   * @param {HTMLVideoElement} video
   * @param {Function} cleanupCallback - Called when video is removed
   */
  setupCleanupObserver(video, cleanupCallback = null) {
    if (!video) return;

    // Store cleanup callback for this video
    if (cleanupCallback) {
      this.videoCleanupCallbacks.set(video, cleanupCallback);
    }

    // Set up shared observer on first call
    if (!this.sharedMutationObserver) {
      this.sharedMutationObserver = new MutationObserver(() => {
        // Check all tracked videos to see if any were removed
        const videos = document.querySelectorAll('video');
        const videosInDOM = new Set(videos);

        // Get all tracked videos by checking WeakMap
        // We need to iterate through all videos we've seen
        videos.forEach(videoElement => {
          if (this.isVideoTracked(videoElement) && !document.contains(videoElement)) {
            // Video was removed from DOM
            const callback = this.videoCleanupCallbacks.get(videoElement);
            if (callback) {
              callback(videoElement);
            }

            // Remove from tracking
            this.removeFromTrackedVideos(videoElement);
            this.videoCleanupCallbacks.delete(videoElement);
          }
        });
      });

      // Observe only the main content area, not entire document.body
      const mainElement = document.querySelector('main') || document.body;
      this.sharedMutationObserver.observe(mainElement, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Process a single video element
   * MUST be implemented by subclasses
   * @param {HTMLVideoElement} video
   * @returns {*} Whatever data the feature needs to track
   */
  processVideo(video) {
    throw new Error(`${this.featureName} must implement processVideo(video)`);
  }

  /**
   * Process all video elements on the page
   * This is the main entry point called by the app
   */
  processAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      try {
        // Skip if no video or already tracked
        if (!video || this.isVideoTracked(video)) {
          return;
        }

        // Process the video
        this.processVideo(video);
      } catch (error) {
        console.error(`${this.featureName}: Error processing video:`, error);
      }
    });
  }

  /**
   * Cleanup all tracked videos and observers
   * Called when feature is disabled or unloaded
   */
  cleanup() {
    // Disconnect shared mutation observer
    if (this.sharedMutationObserver) {
      this.sharedMutationObserver.disconnect();
      this.sharedMutationObserver = null;
    }

    // Clear cleanup callbacks
    // Note: WeakMaps will be garbage collected automatically when videos are removed

    // Subclasses can override to add more cleanup
    this.onCleanup();
  }

  /**
   * Hook for subclass-specific cleanup
   * Override this in subclasses
   */
  onCleanup() {
    // Subclasses can override
  }

  /**
   * Wait for video to be ready
   * @param {HTMLVideoElement} video
   * @param {number} minReadyState - Minimum ready state (default: 2 = HAVE_CURRENT_DATA)
   * @returns {Promise<void>}
   */
  async waitForVideoReady(video, minReadyState = 2) {
    if (!video) return;

    if (video.readyState >= minReadyState) {
      return;
    }

    return new Promise((resolve) => {
      const checkReady = () => {
        if (video.readyState >= minReadyState) {
          resolve();
        } else {
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
    });
  }

  /**
   * Create a button element with common styling
   * @param {string} className - CSS class name
   * @param {string} innerHTML - Inner HTML content
   * @param {string} title - Tooltip title
   * @returns {HTMLButtonElement}
   */
  createButton(className, innerHTML, title = '') {
    const button = document.createElement('button');
    button.className = className;
    button.innerHTML = innerHTML;
    if (title) {
      button.title = title;
    }

    // Add reels-view class if on reels feed
    if (this.isReelsFeed()) {
      button.classList.add('reels-view');
    }

    return button;
  }

  /**
   * Create a container element
   * @param {string} className - CSS class name
   * @returns {HTMLDivElement}
   */
  createContainer(className) {
    const container = document.createElement('div');
    container.className = className;

    // Add reels-view class if on reels feed
    if (this.isReelsFeed()) {
      container.classList.add('reels-view');
    }

    return container;
  }

  /**
   * Add element to video parent with automatic cleanup
   * @param {HTMLVideoElement} video
   * @param {HTMLElement} element
   * @returns {boolean} Success status
   */
  addElementToVideoParent(video, element) {
    const parent = this.getVideoParent(video);
    if (!parent || !element) return false;

    this.ensureParentPositioned(parent);
    parent.appendChild(element);

    return true;
  }
}
