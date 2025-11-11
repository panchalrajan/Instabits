/**
 * VideoObserver - Efficient video element discovery using MutationObserver
 *
 * Replaces polling-based video discovery with event-driven approach:
 * - Uses MutationObserver to watch for new <video> elements
 * - Notifies registered features when new videos appear
 * - Tracks seen videos to avoid redundant notifications
 * - Provides both immediate and debounced notification modes
 *
 * Benefits:
 * - More efficient than setInterval polling
 * - Instant response to new videos
 * - Centralized video discovery logic
 * - Reduces duplicate DOM queries
 */
class VideoObserver {
  constructor() {
    this.features = new Set();
    this.seenVideos = new WeakSet();
    this.observer = null;
    this.isObserving = false;
    this.debounceTimer = null;
    this.debounceDelay = 100; // ms
    this.pendingVideos = new Set();
  }

  /**
   * Register a feature to be notified of new videos
   * @param {BaseFeature} feature - Feature instance with processVideo method
   */
  subscribe(feature) {
    if (!feature || typeof feature.processVideo !== 'function') {
      console.warn('VideoObserver: Feature must have processVideo method');
      return;
    }

    this.features.add(feature);

    // Process existing videos for this new feature
    this.processExistingVideos(feature);
  }

  /**
   * Unregister a feature
   * @param {BaseFeature} feature
   */
  unsubscribe(feature) {
    this.features.delete(feature);
  }

  /**
   * Start observing for video elements
   */
  start() {
    if (this.isObserving) {
      return;
    }

    // Create mutation observer
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.isObserving = true;

    // Process videos that are already in the DOM
    this.processExistingVideos();
  }

  /**
   * Stop observing
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isObserving = false;
  }

  /**
   * Handle DOM mutations
   * @param {MutationRecord[]} mutations
   */
  handleMutations(mutations) {
    const newVideos = [];

    for (const mutation of mutations) {
      // Check added nodes
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }

        // Check if node itself is a video
        if (node.tagName === 'VIDEO') {
          if (!this.seenVideos.has(node)) {
            newVideos.push(node);
            this.seenVideos.add(node);
          }
        }

        // Check if node contains videos
        if (node.querySelectorAll) {
          const videos = node.querySelectorAll('video');
          videos.forEach(video => {
            if (!this.seenVideos.has(video)) {
              newVideos.push(video);
              this.seenVideos.add(video);
            }
          });
        }
      }
    }

    if (newVideos.length > 0) {
      this.notifyFeatures(newVideos);
    }
  }

  /**
   * Process existing videos in the DOM
   * @param {BaseFeature} feature - Optional: process for specific feature only
   */
  processExistingVideos(feature = null) {
    const videos = document.querySelectorAll('video');
    const newVideos = [];

    videos.forEach(video => {
      if (!this.seenVideos.has(video)) {
        newVideos.push(video);
        this.seenVideos.add(video);
      } else if (feature) {
        // If a specific feature is provided, process even if video was seen
        // This handles the case where a feature is registered after videos exist
        newVideos.push(video);
      }
    });

    if (newVideos.length > 0) {
      if (feature) {
        this.notifyFeature(feature, newVideos);
      } else {
        this.notifyFeatures(newVideos);
      }
    }
  }

  /**
   * Notify all subscribed features about new videos
   * @param {HTMLVideoElement[]} videos
   */
  notifyFeatures(videos) {
    if (videos.length === 0 || this.features.size === 0) {
      return;
    }

    // Add to pending videos for debounced processing
    videos.forEach(video => this.pendingVideos.add(video));

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce notifications to batch multiple rapid mutations
    this.debounceTimer = setTimeout(() => {
      const videosToProcess = Array.from(this.pendingVideos);
      this.pendingVideos.clear();

      // Notify each feature
      this.features.forEach(feature => {
        this.notifyFeature(feature, videosToProcess);
      });

      this.debounceTimer = null;
    }, this.debounceDelay);
  }

  /**
   * Notify a single feature about new videos
   * @param {BaseFeature} feature
   * @param {HTMLVideoElement[]} videos
   */
  notifyFeature(feature, videos) {
    videos.forEach(video => {
      try {
        // Skip if feature already tracked this video
        if (feature.isVideoTracked && feature.isVideoTracked(video)) {
          return;
        }

        // Process the video
        feature.processVideo(video);
      } catch (error) {
        console.error(`VideoObserver: Error processing video in ${feature.featureName || 'feature'}:`, error);
      }
    });
  }

  /**
   * Force immediate processing of all pending videos
   * Bypasses debouncing
   */
  flush() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.pendingVideos.size > 0) {
      const videosToProcess = Array.from(this.pendingVideos);
      this.pendingVideos.clear();

      this.features.forEach(feature => {
        this.notifyFeature(feature, videosToProcess);
      });
    }
  }

  /**
   * Clear the seen videos cache
   * Useful when you want to reprocess all videos
   */
  clearCache() {
    this.seenVideos = new WeakSet();
  }

  /**
   * Get number of subscribed features
   * @returns {number}
   */
  getFeatureCount() {
    return this.features.size;
  }

  /**
   * Check if observing
   * @returns {boolean}
   */
  isActive() {
    return this.isObserving;
  }
}

// Create singleton instance
const videoObserver = new VideoObserver();
