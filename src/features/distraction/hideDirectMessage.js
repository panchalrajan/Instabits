/**
 * HideDirectMessage - Hides Direct Message navigation and provides granular control
 *
 * Main Feature: Hide Direct Message links
 * Sub-features (configurable):
 * - Disable Inbox Page: Redirects to homepage when accessing /direct
 * - Hide Floating Button: Hides the floating chat button
 * - Disable Message to Profile: Disables message button on profile pages
 *
 * All features work dynamically across tabs without page refresh
 */
class HideDirectMessage {
  constructor() {
    this.enabled = true;

    // Sub-feature settings
    this.disableInboxPage = false;
    this.hideFloatingButton = false;
    this.disableMessageToProfile = false;

    // DOM state
    this.mutationObserver = null;
    this.hiddenElements = new Set();
    this.styleElement = null;
    this.blockedScreenId = 'instabits-direct-blocked-screen';

    this.init();
  }

  async init() {
    // Load settings from storage
    await this.loadSettings();

    // Create style element
    this.createStyleElement();

    // Setup storage listener for settings changes
    this.setupStorageListener();

    // Initial processing
    this.processPage();

    // Setup mutation observer
    this.setupMutationObserver();

    // Handle inbox page blocking
    this.handleInboxPageBlocking();
  }

  /**
   * Load settings from chrome storage
   */
  async loadSettings() {
    try {
      const settings = await storageService.getMultiple([
        'instabits_hideDirectMessage_disableInboxPage',
        'instabits_hideDirectMessage_hideFloatingButton',
        'instabits_hideDirectMessage_disableMessageToProfile'
      ], {
        'instabits_hideDirectMessage_disableInboxPage': false,
        'instabits_hideDirectMessage_hideFloatingButton': false,
        'instabits_hideDirectMessage_disableMessageToProfile': false
      });

      this.disableInboxPage = settings.instabits_hideDirectMessage_disableInboxPage || false;
      this.hideFloatingButton = settings.instabits_hideDirectMessage_hideFloatingButton || false;
      this.disableMessageToProfile = settings.instabits_hideDirectMessage_disableMessageToProfile || false;
    } catch (error) {
      console.error('[HideDirectMessage] Error loading settings:', error);
    }
  }

  /**
   * Setup storage listener for real-time settings updates
   */
  setupStorageListener() {
    storageService.addChangeListener((changes, areaName) => {
      if (areaName !== 'sync') return;

      let shouldUpdate = false;

      if (changes.instabits_hideDirectMessage_disableInboxPage) {
        this.disableInboxPage = changes.instabits_hideDirectMessage_disableInboxPage.newValue;
        shouldUpdate = true;
      }

      if (changes.instabits_hideDirectMessage_hideFloatingButton) {
        this.hideFloatingButton = changes.instabits_hideDirectMessage_hideFloatingButton.newValue;
        shouldUpdate = true;
      }

      if (changes.instabits_hideDirectMessage_disableMessageToProfile) {
        this.disableMessageToProfile = changes.instabits_hideDirectMessage_disableMessageToProfile.newValue;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        this.processPage();
        this.handleInboxPageBlocking();
      }
    });
  }

  /**
   * Create style element for CSS-based hiding
   */
  createStyleElement() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'instabits-hide-direct-message';
    document.head.appendChild(this.styleElement);
  }

  /**
   * Update styles based on enabled features
   */
  updateStyles() {
    if (!this.styleElement) return;

    let css = '';

    // Always hide DM links when main feature is enabled
    if (this.enabled) {
      css += `
        /* Hide Direct Message navigation links */
        a[href="/direct/inbox/"],
        a[href*="/direct/inbox"] {
          display: none !important;
        }
      `;
    }

    // Hide floating button if enabled
    if (this.enabled && this.hideFloatingButton) {
      css += `
        /* Hide floating chat button */
        [data-pagelet="IGDChatTabsRootContent"] {
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
   * Check if on direct messages page
   */
  isDirectPage() {
    return this.getCurrentPath().includes('/direct');
  }

  /**
   * Process all page elements
   */
  processPage() {
    // Update CSS styles
    this.updateStyles();

    // Handle message button disabling (requires DOM manipulation)
    if (this.enabled && this.disableMessageToProfile) {
      this.disableMessageButtons();
    } else {
      this.enableMessageButtons();
    }
  }

  /**
   * Disable message buttons on profile pages
   */
  disableMessageButtons() {
    const messageButtons = Array.from(document.querySelectorAll('[role="button"]'))
      .filter(el => el.textContent.trim() === 'Message');

    messageButtons.forEach(btn => {
      if (!btn.hasAttribute('data-instabits-disabled')) {
        btn.setAttribute('data-instabits-disabled', 'true');
        btn.setAttribute('data-instabits-original-text', btn.textContent);
        btn.textContent = 'Message Disabled by InstaBits';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      }
    });
  }

  /**
   * Re-enable message buttons
   */
  enableMessageButtons() {
    const disabledButtons = document.querySelectorAll('[data-instabits-disabled="true"]');

    disabledButtons.forEach(btn => {
      const originalText = btn.getAttribute('data-instabits-original-text');
      if (originalText) {
        btn.textContent = originalText;
      }
      btn.removeAttribute('data-instabits-disabled');
      btn.removeAttribute('data-instabits-original-text');
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
      btn.style.cursor = '';
    });
  }

  /**
   * Handle inbox page blocking with redirect or blocked screen
   */
  handleInboxPageBlocking() {
    if (this.enabled && this.disableInboxPage && this.isDirectPage()) {
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
      title: 'Direct Messages Blocked',
      subtitle: 'You\'ve blocked Direct Messages to stay focused. Take a break or disable this feature in settings.',
      ctaText: 'Go to Homepage',
      ctaLink: '/',
      iconName: 'message-circle-off'
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
    this.handleInboxPageBlocking();
  }

  /**
   * Disable the feature
   */
  disable() {
    this.enabled = false;
    this.updateStyles(); // Clear styles
    this.enableMessageButtons(); // Re-enable message buttons
    this.removeBlockedScreen(); // Remove blocked screen
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

    // Re-enable all buttons
    this.enableMessageButtons();

    // Remove blocked screen
    this.removeBlockedScreen();
  }
}
