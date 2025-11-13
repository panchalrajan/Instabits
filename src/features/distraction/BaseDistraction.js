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

    try {
      if (elements instanceof Node) {
        elements.style.display = 'none';
      } else if (elements instanceof NodeList || Array.isArray(elements)) {
        elements.forEach((element) => {
          if (element) {
            try {
              element.style.display = 'none';
            } catch (error) {
              console.error(`${this.featureName}: Error hiding element:`, error);
            }
          }
        });
      }
    } catch (error) {
      console.error(`${this.featureName}: Error in hideElements:`, error);
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
   * Create a reusable blocked screen component
   * @param {Object} options - Configuration options
   * @param {string} options.id - Unique ID for the screen
   * @param {string} options.title - Title text (e.g., "Reels Blocked")
   * @param {string} options.description - Description text
   * @param {string} options.iconSvg - SVG markup for the icon
   * @returns {HTMLElement} The blocked screen element
   */
  createBlockedScreenComponent(options) {
    const { id, title, description, iconSvg } = options;

    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'instabits-blocked-screen';

    const content = document.createElement('div');
    content.className = 'instabits-blocked-content';

    content.innerHTML = `
      <div class="instabits-blocked-icon">
        ${iconSvg}
      </div>
      <h1 class="instabits-blocked-title">${title}</h1>
      <p class="instabits-blocked-description">
        ${description}
      </p>
      <div class="instabits-blocked-actions">
        <button class="instabits-blocked-button instabits-blocked-button-primary" data-action="go-home">
          Go to Homepage
        </button>
      </div>
      <div class="instabits-blocked-footer">
        Blocked by <a href="#" data-action="open-settings">InstaBits</a>
      </div>
    `;

    screen.appendChild(content);

    // Get button references
    const homeBtn = content.querySelector('[data-action="go-home"]');
    const settingsLink = content.querySelector('[data-action="open-settings"]');

    // Add event listeners
    if (homeBtn) {
      homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/';
      });
    }

    if (settingsLink) {
      settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        chrome.runtime.openOptionsPage();
      });
    }

    return screen;
  }

  /**
   * Start observing DOM mutations
   * Child classes should override this to implement specific hiding logic
   */
  startObserving() {
    try {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new MutationObserver(() => {
        try {
          this.hideDistraction();
        } catch (error) {
          console.error(`${this.featureName}: Error in hideDistraction:`, error);
        }
      });

      this.observer.observe(document.body, {
        subtree: true,
        childList: true
      });

      // Initial hide
      this.hideDistraction();
    } catch (error) {
      console.error(`${this.featureName}: Error starting observer:`, error);
    }
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
