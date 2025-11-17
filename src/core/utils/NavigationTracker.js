/**
 * NavigationTracker - Centralized navigation state tracking for Instagram SPA
 *
 * Responsibilities:
 * - Track current URL, domain, pathname, and route information
 * - Detect Instagram SPA navigation (pushState/replaceState/popstate)
 * - Provide event system for features to react to navigation changes
 * - Centralize all location-based checks
 *
 * Benefits:
 * - Single source of truth for navigation state
 * - Features work consistently whether page is loaded or navigated via clicks
 * - Eliminates duplicate window.location checks across codebase
 * - Easy to test and debug navigation issues
 *
 * Usage:
 *   navigationTracker.onNavigate((state) => {
 *     console.log('Navigated to:', state.pathname);
 *   });
 *
 *   if (navigationTracker.isReelsFeed()) {
 *     // Do something for reels feed
 *   }
 */
class NavigationTracker {
  constructor() {
    this.currentState = this.captureState();
    this.listeners = new Set();
    this.isTracking = false;
    this.originalPushState = null;
    this.originalReplaceState = null;
  }

  /**
   * Capture current navigation state
   * @returns {Object} Navigation state
   */
  captureState() {
    return {
      href: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
      hostname: window.location.hostname,
      port: window.location.port,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin,
      timestamp: Date.now()
    };
  }

  /**
   * Start tracking navigation changes
   */
  start() {
    if (this.isTracking) {
      console.warn('[NavigationTracker] Already tracking');
      return;
    }

    // Intercept pushState
    this.originalPushState = history.pushState;
    history.pushState = (...args) => {
      this.originalPushState.apply(history, args);
      this.handleNavigation('pushState');
    };

    // Intercept replaceState
    this.originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      this.originalReplaceState.apply(history, args);
      this.handleNavigation('replaceState');
    };

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', this.handlePopState);

    this.isTracking = true;
    console.log('[NavigationTracker] Started tracking navigation');
  }

  /**
   * Stop tracking navigation changes
   */
  stop() {
    if (!this.isTracking) {
      return;
    }

    // Restore original methods
    if (this.originalPushState) {
      history.pushState = this.originalPushState;
      this.originalPushState = null;
    }

    if (this.originalReplaceState) {
      history.replaceState = this.originalReplaceState;
      this.originalReplaceState = null;
    }

    // Remove popstate listener
    window.removeEventListener('popstate', this.handlePopState);

    this.isTracking = false;
    console.log('[NavigationTracker] Stopped tracking navigation');
  }

  /**
   * Handle popstate event (bound to instance)
   */
  handlePopState = () => {
    this.handleNavigation('popstate');
  };

  /**
   * Handle navigation change
   * @param {string} type - Type of navigation (pushState, replaceState, popstate)
   */
  handleNavigation(type) {
    const previousState = this.currentState;
    const newState = this.captureState();

    // Only notify if pathname actually changed
    if (previousState.pathname !== newState.pathname) {
      this.currentState = newState;
      this.notifyListeners(newState, previousState, type);
    }
  }

  /**
   * Notify all listeners of navigation change
   * @param {Object} newState - New navigation state
   * @param {Object} previousState - Previous navigation state
   * @param {string} type - Type of navigation
   */
  notifyListeners(newState, previousState, type) {
    this.listeners.forEach(listener => {
      try {
        listener(newState, previousState, type);
      } catch (error) {
        console.error('[NavigationTracker] Error in listener:', error);
      }
    });
  }

  /**
   * Register a navigation change listener
   * @param {Function} callback - Callback function (newState, previousState, type) => void
   * @returns {Function} Unsubscribe function
   */
  onNavigate(callback) {
    if (typeof callback !== 'function') {
      console.warn('[NavigationTracker] Listener must be a function');
      return () => {};
    }

    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current navigation state
   * @returns {Object}
   */
  getState() {
    return { ...this.currentState };
  }

  /**
   * Get current pathname
   * @returns {string}
   */
  getPathname() {
    return this.currentState.pathname;
  }

  /**
   * Get current hostname/domain
   * @returns {string}
   */
  getHostname() {
    return this.currentState.hostname;
  }

  /**
   * Get current full URL
   * @returns {string}
   */
  getHref() {
    return this.currentState.href;
  }

  /**
   * Check if current page is Instagram
   * @returns {boolean}
   */
  isInstagram() {
    return this.currentState.hostname.includes('instagram.com');
  }

  /**
   * Check if current page is the reels feed (/reels/)
   * @returns {boolean}
   */
  isReelsFeed() {
    return this.currentState.pathname.includes('/reels/');
  }

  /**
   * Check if current page is a single reel (/reel/)
   * @returns {boolean}
   */
  isSingleReel() {
    return this.currentState.pathname.includes('/reel/');
  }

  /**
   * Check if current page is any reel page (feed or single)
   * @returns {boolean}
   */
  isReelsPage() {
    return this.isReelsFeed() || this.isSingleReel();
  }

  /**
   * Check if current page is a profile page
   * @returns {boolean}
   */
  isProfilePage() {
    const pathname = this.currentState.pathname;
    // Profile pages are typically /username/ but not /p/, /reel/, /reels/, etc.
    return pathname !== '/' &&
           !pathname.includes('/p/') &&
           !pathname.includes('/reel') &&
           !pathname.includes('/explore') &&
           !pathname.includes('/direct') &&
           !pathname.includes('/stories');
  }

  /**
   * Check if current page is a post page (/p/)
   * @returns {boolean}
   */
  isPostPage() {
    return this.currentState.pathname.includes('/p/');
  }

  /**
   * Check if current page is the explore page
   * @returns {boolean}
   */
  isExplorePage() {
    return this.currentState.pathname.includes('/explore');
  }

  /**
   * Check if current page is the home feed
   * @returns {boolean}
   */
  isHomeFeed() {
    return this.currentState.pathname === '/';
  }

  /**
   * Check if pathname matches a pattern
   * @param {string|RegExp} pattern - Pattern to match against pathname
   * @returns {boolean}
   */
  matchesPathname(pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(this.currentState.pathname);
    }
    return this.currentState.pathname.includes(pattern);
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    return {
      isTracking: this.isTracking,
      listenerCount: this.listeners.size,
      currentPathname: this.currentState.pathname,
      isInstagram: this.isInstagram(),
      isReelsPage: this.isReelsPage()
    };
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    this.listeners.clear();
  }
}

// Create singleton instance
const navigationTracker = new NavigationTracker();
