/**
 * HideStories - Hides Instagram Stories and provides granular control
 *
 * Main Feature: Hide Stories tray on homepage
 * Sub-features (configurable):
 * - Disable Stories Page: Shows blocked screen when accessing /stories
 * - Hide all Profile Stories: Hides story rings around profile pictures
 *
 * All features work dynamically across tabs without page refresh
 */
class HideStories {
  constructor() {
    this.enabled = true;

    // Sub-feature settings
    this.disableStoriesPage = false;
    this.hideProfileStories = false;

    // DOM state
    this.mutationObserver = null;
    this.styleElement = null;
    this.blockedScreenId = 'instabits-stories-blocked-screen';
    this.currentPath = window.location.pathname;
    this.urlCheckInterval = null;

    this.init();
  }

  async init() {
    // Load settings from storage
    await this.loadSettings();

    // Create style element
    this.createStyleElement();

    // Setup storage listener for settings changes
    this.setupStorageListener();

    // Setup URL change listener for client-side navigation
    this.setupURLChangeListener();

    // Initial processing
    this.processPage();

    // Setup mutation observer
    this.setupMutationObserver();

    // Handle stories page blocking
    this.handleStoriesPageBlocking();
  }

  /**
   * Load settings from chrome storage
   */
  async loadSettings() {
    try {
      const settings = await storageService.getMultiple([
        'instabits_hideStories_disableStoriesPage',
        'instabits_hideStories_hideProfileStories'
      ], {
        'instabits_hideStories_disableStoriesPage': false,
        'instabits_hideStories_hideProfileStories': false
      });

      this.disableStoriesPage = settings.instabits_hideStories_disableStoriesPage || false;
      this.hideProfileStories = settings.instabits_hideStories_hideProfileStories || false;
    } catch (error) {
      console.error('[HideStories] Error loading settings:', error);
    }
  }

  /**
   * Setup storage listener for real-time settings updates
   */
  setupStorageListener() {
    storageService.addChangeListener((changes, areaName) => {
      if (areaName !== 'sync') return;

      let shouldUpdate = false;

      if (changes.instabits_hideStories_disableStoriesPage) {
        this.disableStoriesPage = changes.instabits_hideStories_disableStoriesPage.newValue;
        shouldUpdate = true;
      }

      if (changes.instabits_hideStories_hideProfileStories) {
        this.hideProfileStories = changes.instabits_hideStories_hideProfileStories.newValue;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        this.processPage();
        this.handleStoriesPageBlocking();
      }
    });
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
        // URL changed, handle stories page blocking
        this.handleStoriesPageBlocking();
      }
    }, 500);
  }

  /**
   * Create style element for CSS-based hiding
   */
  createStyleElement() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'instabits-hide-stories';
    document.head.appendChild(this.styleElement);
  }

  /**
   * Update styles based on enabled features
   */
  updateStyles() {
    if (!this.styleElement) return;

    let css = '';

    // Hide story tray when main feature is enabled
    if (this.enabled) {
      css += `
        /* Hide Stories tray */
        [data-pagelet="story_tray"] {
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
   * Check if on stories page
   */
  isStoriesPage() {
    return this.getCurrentPath().includes('/stories');
  }

  /**
   * Hide profile story rings
   * Finds profile pictures with story rings and hides the ring while keeping profile clickable
   */
  hideProfileStoryRings() {
    if (!this.enabled || !this.hideProfileStories) return;

    // Find all divs with role="button" that might contain profile stories
    document.querySelectorAll('div[role="button"]').forEach(div => {
      const canvas = div.querySelector('canvas');
      const img = div.querySelector('img[alt*="profile picture"]');

      if (canvas && img) {
        // hide only the ring
        canvas.style.display = "none";

        // disable ONLY this story button click
        div.style.pointerEvents = "none";

        // re-enable children except the story link itself
        div.querySelectorAll('*').forEach(el => {
          el.style.pointerEvents = "auto";
        });

        // disable ONLY the story-pic link
        const storyLink = img.closest('[role="link"]');
        if (storyLink) {
          storyLink.style.pointerEvents = "none";
          storyLink.style.cursor = "default";
        }
      }
    });
  }

  /**
   * Restore profile story rings
   * Re-enables story rings when feature is disabled
   */
  restoreProfileStoryRings() {
    document.querySelectorAll('div[role="button"]').forEach(div => {
      const canvas = div.querySelector('canvas');
      const img = div.querySelector('img[alt*="profile picture"]');

      if (canvas && img) {
        // Restore canvas visibility
        canvas.style.display = '';

        // Restore pointer events
        div.style.pointerEvents = '';

        // Reset children pointer events
        div.querySelectorAll('*').forEach(el => {
          el.style.pointerEvents = '';
        });

        // Restore story link
        const storyLink = img.closest('[role="link"]');
        if (storyLink) {
          storyLink.style.pointerEvents = '';
          storyLink.style.cursor = '';
        }
      }
    });
  }

  /**
   * Process all page elements
   */
  processPage() {
    // Update CSS styles
    this.updateStyles();

    // Process profile story rings
    if (this.enabled && this.hideProfileStories) {
      this.hideProfileStoryRings();
    } else if (!this.hideProfileStories) {
      this.restoreProfileStoryRings();
    }
  }

  /**
   * Handle stories page blocking with blocked screen
   */
  handleStoriesPageBlocking() {
    if (this.enabled && this.disableStoriesPage && this.isStoriesPage()) {
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
      title: 'Stories Blocked',
      subtitle: 'You\'ve blocked Stories to stay focused. Take a break or disable this feature in settings.',
      ctaText: 'Go to Homepage',
      ctaLink: '/',
      iconName: 'film-off'
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
    this.handleStoriesPageBlocking();

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
    this.restoreProfileStoryRings(); // Restore profile story rings

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

    // Restore profile story rings
    this.restoreProfileStoryRings();
  }
}
