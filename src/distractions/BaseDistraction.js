/**
 * BaseDistraction - Abstract base class for all distraction-hiding features
 * Provides common functionality for hiding Instagram UI elements
 */
class BaseDistraction extends BaseFeature {
  constructor() {
    super();
    this.observer = null;
  }

  /**
   * Hide element(s) by setting display: none
   * @param {Node|NodeList|Array} elements - Element(s) to hide
   */
  hideElements(elements) {
    if (!elements) {
      return;
    }

    if (elements instanceof Node) {
      elements.style.display = 'none';
    } else if (elements instanceof NodeList || Array.isArray(elements)) {
      elements.forEach((element) => {
        if (element) {
          element.style.display = 'none';
        }
      });
    }
  }

  /**
   * Show element(s) by removing display style
   * @param {Node|NodeList|Array} elements - Element(s) to show
   */
  showElements(elements) {
    if (!elements) {
      return;
    }

    if (elements instanceof Node) {
      elements.style.display = '';
    } else if (elements instanceof NodeList || Array.isArray(elements)) {
      elements.forEach((element) => {
        if (element) {
          element.style.display = '';
        }
      });
    }
  }

  /**
   * Get current URL path
   * @returns {string}
   */
  getCurrentPath() {
    return window.location.pathname;
  }

  /**
   * Check if current path matches a pattern
   * @param {string} pattern - Pattern to match
   * @returns {boolean}
   */
  isPathMatch(pattern) {
    return this.getCurrentPath().includes(pattern);
  }

  /**
   * Initialize the distraction feature - automatically starts observing
   */
  initialize() {
    this.startObserving();
  }

  /**
   * Distractions don't process individual videos
   * This is a no-op to satisfy BaseFeature interface
   */
  processVideo(video) {
    return null;
  }

  /**
   * Start observing DOM mutations
   * Child classes should override this to implement specific hiding logic
   */
  startObserving() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(() => {
      this.hideDistraction();
    });

    this.observer.observe(document.body, {
      subtree: true,
      childList: true
    });

    // Initial hide
    this.hideDistraction();
  }

  /**
   * Hide the distraction - must be implemented by child classes
   * This is called on every DOM mutation
   */
  hideDistraction() {
    throw new Error('hideDistraction() must be implemented by child class');
  }

  /**
   * Enable the distraction hiding
   */
  enable() {
    this.startObserving();
  }

  /**
   * Cleanup when feature is disabled
   */
  onCleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
