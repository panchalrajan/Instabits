/**
 * HideExplore - Hides Explore page links and blocks access to explore page
 *
 * Main Feature: Hide Explore links across Instagram
 * - Hides all links containing /explore/
 * - Shows blocked screen when accessing /explore page
 *
 * All features work dynamically across tabs without page refresh
 */
class HideExplore {
  constructor() {
    this.enabled = true;

    // DOM state
    this.mutationObserver = null;
    this.styleElement = null;
    this.blockedScreenId = 'instabits-explore-blocked-screen';
    this.currentPath = window.location.pathname;
    this.urlCheckInterval = null;

    this.init();
  }

  async init() {
    // Create style element
    this.createStyleElement();

    // Setup URL change listener for client-side navigation
    this.setupURLChangeListener();

    // Initial processing
    this.processPage();

    // Setup mutation observer
    this.setupMutationObserver();

    // Handle explore page blocking
    this.handleExplorePageBlocking();
  }

  /**
   * Setup URL change listener to detect client-side navigation
   * Instagram uses React Router which changes URL without page reload
   */
  setupURLChangeListener() {
    // Check for URL changes every 500ms
    this.urlCheckInterval = setInterval(() => {
      const newPath = window.location.pathname;

      if (newPath !== this.currentPath) {
        this.currentPath = newPath;
        // URL changed, handle explore page blocking
        this.handleExplorePageBlocking();
      }
    }, 500);
  }

  /**
   * Create style element for CSS-based hiding
   */
  createStyleElement() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'instabits-hide-explore';
    document.head.appendChild(this.styleElement);
  }

  /**
   * Update styles based on enabled state
   */
  updateStyles() {
    if (!this.styleElement) return;

    let css = '';

    // Hide explore links when feature is enabled
    if (this.enabled) {
      css += `
        /* Hide Explore navigation links */
        a[href*="/explore/"] {
          display: none !important;
        }
      `;
    }

    this.styleElement.textContent = css;
  }

  /**
   * Get current path
   */
  getCurrentPath() {
    return window.location.pathname;
  }

  /**
   * Check if on explore page
   */
  isExplorePage() {
    return this.getCurrentPath().includes('/explore');
  }

  /**
   * Process all page elements
   */
  processPage() {
    // Update CSS styles
    this.updateStyles();
  }

  /**
   * Handle explore page blocking with blocked screen
   */
  handleExplorePageBlocking() {
    if (this.enabled && this.isExplorePage()) {
      // Show blocked screen
      this.showBlockedScreen();
    } else {
      // Remove blocked screen if exists
      this.removeBlockedScreen();
    }
  }

  /**
   * Create and show blocked screen
   */
  async showBlockedScreen() {
    // Remove existing screen if present
    this.removeBlockedScreen();

    const blockedScreen = this.createBlockedScreenElement();

    // Hide main content
    const mainContent = document.querySelector('[role="main"]');
    if (mainContent) {
      mainContent.style.display = 'none';
    }

    // Insert blocked screen
    document.body.appendChild(blockedScreen);
  }

  /**
   * Remove blocked screen and restore main content
   */
  removeBlockedScreen() {
    const existingScreen = document.getElementById(this.blockedScreenId);
    if (existingScreen) {
      existingScreen.remove();
    }

    // Restore main content
    const mainContent = document.querySelector('[role="main"]');
    if (mainContent) {
      mainContent.style.display = '';
    }
  }

  /**
   * Create blocked screen element
   */
  createBlockedScreenElement() {
    return BlockedScreen.create({
      id: this.blockedScreenId,
      title: 'Explore Page Blocked',
      subtitle: 'You\'ve blocked the Explore page to stay focused. Take a break or disable this feature in settings.',
      ctaText: 'Go to Homepage',
      ctaLink: '/',
      iconName: 'search'
    });
  }

  /**
   * Setup mutation observer
   */
  setupMutationObserver() {
    if (this.mutationObserver) return;

    this.mutationObserver = new MutationObserver(() => {
      if (this.enabled) {
        this.processPage();
      }
    });

    const targetNode = document.querySelector('main') || document.body;
    this.mutationObserver.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Enable the feature
   */
  enable() {
    this.enabled = true;
    this.processPage();
    this.handleExplorePageBlocking();

    // Restart URL listener if not already running
    if (!this.urlCheckInterval) {
      this.setupURLChangeListener();
    }
  }

  /**
   * Disable the feature
   */
  disable() {
    this.enabled = false;
    this.updateStyles(); // Clear styles
    this.removeBlockedScreen(); // Remove blocked screen

    // Clear URL check interval when disabled
    if (this.urlCheckInterval) {
      clearInterval(this.urlCheckInterval);
      this.urlCheckInterval = null;
    }
  }

  /**
   * Process all videos - compatibility with FeatureManager
   */
  processAllVideos() {
    this.processPage();
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Clear URL check interval
    if (this.urlCheckInterval) {
      clearInterval(this.urlCheckInterval);
      this.urlCheckInterval = null;
    }

    // Disconnect observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Remove style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }

    // Remove blocked screen
    this.removeBlockedScreen();
  }
}
