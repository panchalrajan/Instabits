/**
 * HideReels - Hides Reels navigation links and provides configurable blocking options
 *
 * Features:
 * - Hides reels navigation links across Instagram
 * - Disable Reels Page: Blocks access to /reels/{id} pages
 * - Disable Profile Reel Tab: Disables the reels tab button on profile pages
 *
 * All changes are dynamic and work across all Instagram tabs without refresh
 */
class HideReels {
  constructor() {
    this.enabled = true;
    this.disableReelsPage = false;
    this.disableProfileReelTab = false;
    this.styleElement = null;
    this.mutationObserver = null;
    this.blockedScreenId = 'instabits-reels-blocked-screen';
    this.init();
  }

  /**
   * Initialize the feature
   */
  async init() {
    // Load settings from storage
    await this.loadSettings();

    // Create style element
    this.createStyleElement();

    // Setup storage listener for settings changes
    this.setupStorageListener();

    // Update styles
    this.updateStyles();

    // Initial processing
    this.processPage();

    // Setup mutation observer
    this.setupMutationObserver();
  }

  /**
   * Load settings from chrome storage
   */
  async loadSettings() {
    try {
      const settings = await storageService.getMultiple([
        'instabits_hideReels_disableReelsPage',
        'instabits_hideReels_disableProfileReelTab'
      ], {
        'instabits_hideReels_disableReelsPage': false,
        'instabits_hideReels_disableProfileReelTab': false
      });

      this.disableReelsPage = settings.instabits_hideReels_disableReelsPage || false;
      this.disableProfileReelTab = settings.instabits_hideReels_disableProfileReelTab || false;
    } catch (error) {
      console.error('[HideReels] Error loading settings:', error);
    }
  }

  /**
   * Setup storage listener for real-time settings updates
   */
  setupStorageListener() {
    storageService.addChangeListener((changes, areaName) => {
      if (areaName !== 'sync') return;

      let settingsChanged = false;

      if (changes.instabits_hideReels_disableReelsPage) {
        this.disableReelsPage = changes.instabits_hideReels_disableReelsPage.newValue || false;
        settingsChanged = true;
      }

      if (changes.instabits_hideReels_disableProfileReelTab) {
        this.disableProfileReelTab = changes.instabits_hideReels_disableProfileReelTab.newValue || false;
        settingsChanged = true;
      }

      if (settingsChanged && this.enabled) {
        this.processPage();
      }
    });
  }

  /**
   * Create style element for CSS injection
   */
  createStyleElement() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'instabits-hide-reels';
    document.head.appendChild(this.styleElement);
  }

  /**
   * Update styles based on enabled state
   */
  updateStyles() {
    if (!this.styleElement) return;

    let css = '';

    // Always hide Reels links when main feature is enabled
    if (this.enabled) {
      css += `
        /* Hide Reels navigation links */
        a[href="/reels/"],
        a[href*="instagram.com/reels/"] {
          display: none !important;
        }
      `;
    }

    this.styleElement.textContent = css;
  }

  /**
   * Process the current page
   */
  processPage() {
    if (!this.enabled) {
      this.removeBlockedScreen();
      this.enableReelTabButtons();
      return;
    }

    // Handle reels page blocking
    this.handleReelsPageBlocking();

    // Handle profile reel tab disabling
    this.handleProfileReelTab();
  }

  /**
   * Handle reels page blocking
   */
  handleReelsPageBlocking() {
    const currentPath = window.location.pathname;

    // Check if we're on a reels page (/reels/{id})
    const isOnReelsPage = /^\/reels\/[^/]+\/?$/.test(currentPath);

    if (isOnReelsPage && this.disableReelsPage) {
      this.showBlockedScreen();
    } else {
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
      title: 'Reels Blocked',
      subtitle: 'You\'ve blocked Reels to stay focused. Take a break or disable this feature in settings.',
      ctaText: 'Go to Homepage',
      ctaLink: '/',
      iconName: 'block'
    });
  }

  /**
   * Handle profile reel tab disabling
   */
  handleProfileReelTab() {
    const currentPath = window.location.pathname;

    // Check if we're on a profile page (/{username})
    const isOnProfilePage = /^\/[^/]+\/?$/.test(currentPath) && currentPath !== '/';

    if (isOnProfilePage && this.disableProfileReelTab) {
      this.disableReelTabButtons();
    } else {
      this.enableReelTabButtons();
    }
  }

  /**
   * Disable reel tab buttons on profile pages
   */
  disableReelTabButtons() {
    // Find the reels tab button using the SVG path
    const reelButtons = [...document.querySelectorAll('a')].filter(a =>
      a.querySelector('svg path[d="M2.0493 7.002 21.9503 7.002"]')
    );

    reelButtons.forEach(reelBtn => {
      if (reelBtn.dataset.instabitsDisabled === 'true') return;

      reelBtn.dataset.instabitsDisabled = 'true';
      reelBtn.style.pointerEvents = 'none';
      reelBtn.style.opacity = '0.4';
      reelBtn.style.cursor = 'not-allowed';
    });
  }

  /**
   * Enable reel tab buttons on profile pages
   */
  enableReelTabButtons() {
    const disabledButtons = document.querySelectorAll('a[data-instabits-disabled="true"]');

    disabledButtons.forEach(btn => {
      btn.dataset.instabitsDisabled = 'false';
      btn.style.pointerEvents = '';
      btn.style.opacity = '';
      btn.style.cursor = '';
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
    this.updateStyles();
    this.processPage();
  }

  /**
   * Disable the feature
   */
  disable() {
    this.enabled = false;
    this.updateStyles();
    this.removeBlockedScreen();
    this.enableReelTabButtons();
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

    // Remove blocked screen
    this.removeBlockedScreen();

    // Re-enable all buttons
    this.enableReelTabButtons();
  }
}
