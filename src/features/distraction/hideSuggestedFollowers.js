/**
 * HideSuggestedFollowers - Hides suggested followers section on Instagram home page
 *
 * This feature hides the "Suggested for you" section that appears on the home page.
 *
 * Works on:
 * - Instagram home page (/)
 *
 * Dynamic behavior:
 * - Can be enabled/disabled without page refresh
 * - Works across all active Instagram tabs automatically
 * - Uses CSS-based hiding for instant show/hide
 */
class HideSuggestedFollowers {
  constructor() {
    this.enabled = true;
    this.mutationObserver = null;
    this.hiddenElements = new Set();
    this.styleElement = null;
    this.init();
  }

  init() {
    // Create and inject style element for hiding
    this.createStyleElement();

    // Initial processing
    this.processSuggestedFollowers();

    // Set up mutation observer to watch for new suggested followers
    this.setupMutationObserver();
  }

  /**
   * Create a style element to hide suggested followers
   */
  createStyleElement() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'instabits-hide-suggested-followers';
    document.head.appendChild(this.styleElement);

    if (this.enabled) {
      this.updateStyles(true);
    }
  }

  /**
   * Update CSS styles to hide/show suggested followers
   */
  updateStyles(hide) {
    if (!this.styleElement) return;

    if (hide) {
      this.styleElement.textContent = `
        /* Hide suggested followers section */
        [data-instabits-suggested-followers] {
          display: none !important;
        }
      `;
    } else {
      this.styleElement.textContent = '';
    }
  }

  /**
   * Check if current page is home page
   */
  isHomePage() {
    return window.location.pathname === '/';
  }

  /**
   * Process and mark suggested followers elements
   */
  processSuggestedFollowers() {
    if (!this.isHomePage()) return;

    // Find the "Suggested for you" link
    const suggestedLinks = document.querySelectorAll('a[href*="/explore/people/"]');

    suggestedLinks.forEach(link => {
      // Check if this is the "Suggested for you" section
      const linkText = link.textContent.toLowerCase();
      if (linkText.includes('suggested') || linkText.includes('see all')) {
        this.markSuggestedSection(link);
      }
    });
  }

  /**
   * Mark the suggested followers section with data attribute
   */
  markSuggestedSection(suggestedLink) {
    if (!suggestedLink || suggestedLink.hasAttribute('data-instabits-suggested-followers')) {
      return;
    }

    // Mark the link itself
    suggestedLink.setAttribute('data-instabits-suggested-followers', 'true');

    // Find and mark the container
    // The structure is usually: div (title container) -> next sibling (list)
    const titleContainer = suggestedLink.closest('div[class]');
    if (titleContainer) {
      titleContainer.setAttribute('data-instabits-suggested-followers', 'true');

      // Mark the suggested followers list (next sibling)
      const suggestedList = titleContainer.nextElementSibling;
      if (suggestedList) {
        suggestedList.setAttribute('data-instabits-suggested-followers', 'true');
      }

      // Sometimes the entire section is wrapped in a parent container
      const sectionContainer = titleContainer.parentElement;
      if (sectionContainer && sectionContainer.tagName === 'DIV') {
        // Check if this parent contains both title and list
        const childDivs = sectionContainer.querySelectorAll(':scope > div');
        if (childDivs.length >= 2) {
          sectionContainer.setAttribute('data-instabits-suggested-followers', 'true');
        }
      }
    }
  }

  /**
   * Set up mutation observer to watch for DOM changes
   */
  setupMutationObserver() {
    if (this.mutationObserver) return;

    this.mutationObserver = new MutationObserver(() => {
      if (this.enabled && this.isHomePage()) {
        this.processSuggestedFollowers();
      }
    });

    // Observe the main element or body
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
    this.updateStyles(true);
    this.processSuggestedFollowers();
  }

  /**
   * Disable the feature
   */
  disable() {
    this.enabled = false;
    this.updateStyles(false);
  }

  /**
   * Process all videos - compatibility with BaseFeature pattern
   */
  processAllVideos() {
    // This method is called by FeatureManager pattern compatibility
    this.processSuggestedFollowers();
  }

  /**
   * Cleanup when feature is disabled or unloaded
   */
  cleanup() {
    // Disconnect mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Remove style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }

    // Remove all data attributes
    const markedElements = document.querySelectorAll('[data-instabits-suggested-followers]');
    markedElements.forEach(el => {
      el.removeAttribute('data-instabits-suggested-followers');
    });

    this.hiddenElements.clear();
  }
}
