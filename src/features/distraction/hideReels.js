/**
 * HideReels - Hides Reels navigation link and optionally blocks reels page
 */
class HideReels extends BaseDistraction {
  constructor() {
    super();
    this.blockReelsScreen = true;
    this.blockedScreenId = 'instabits-reels-blocked-screen';
    this.hiddenReelsLinks = new Set();
    this.hiddenMainContent = null;
    this.setupMessageListener();
  }

  async initialize() {
    await this.loadSettings();
    super.initialize();
  }

  async loadSettings() {
    try {
      this.blockReelsScreen = await storageService.getUserPreference('blockReelsScreen', true);
    } catch (error) {
      console.error('HideReels: Error loading settings:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'updateHideReelsSettings') {
        if (message.blockReelsScreen !== undefined) {
          this.blockReelsScreen = message.blockReelsScreen;
          // Immediately apply the changes without refresh
          this.hideDistraction();
        }
      }
    });
  }

  async isForceFollowingEnabled() {
    try {
      return await storageService.getFeatureState('forceFollowing');
    } catch (error) {
      return false;
    }
  }

  async createBlockedScreen() {
    const forceFollowingEnabled = await this.isForceFollowingEnabled();
    const buttonText = forceFollowingEnabled ? 'Go to Following Feed' : 'Go to Homepage';
    const buttonUrl = forceFollowingEnabled ? '/?variant=following' : '/';

    return this.createBlockedScreenComponent({
      id: this.blockedScreenId,
      title: 'Reels Blocked',
      description: "You've blocked Reels to stay focused. Take a break or disable this feature in settings.",
      buttonText,
      buttonUrl,
      iconSvg: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="2" y="6" width="20" height="12" rx="2" stroke-width="2"/>
          <path d="M2 6l6 6M8 6l-6 6M16 6l6 6M22 6l-6 6" stroke-width="2" stroke-linecap="round"/>
          <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
    });
  }

  async hideDistraction() {
    const path = this.getCurrentPath();

    // Hide reels navigation links and track them
    const reelsLinks = document.body?.querySelectorAll('a[href*="/reels/"]');
    if (reelsLinks && reelsLinks.length > 0) {
      reelsLinks.forEach(link => {
        if (link.style.display !== 'none') {
          this.hiddenReelsLinks.add(link);
          link.style.display = 'none';
        }
      });
    }

    if (path.includes('/reels')) {
      if (this.blockReelsScreen) {
        // Block reels screen is enabled - hide main content and show blocked screen
        const mainContent = document.body?.querySelector('[role="main"]');
        if (mainContent && mainContent.style.display !== 'none') {
          this.hiddenMainContent = mainContent;
          this.hideElements(mainContent);
        }

        if (!document.getElementById(this.blockedScreenId)) {
          const blockedScreen = await this.createBlockedScreen();
          document.body.appendChild(blockedScreen);
        }
      } else {
        // Block reels screen is disabled - remove blocked screen and restore main content
        const existingScreen = document.getElementById(this.blockedScreenId);
        if (existingScreen) {
          existingScreen.remove();
        }

        // Restore main content
        if (this.hiddenMainContent) {
          this.showElements(this.hiddenMainContent);
          this.hiddenMainContent = null;
        }
      }
    } else {
      // Not on reels page - remove blocked screen if it exists
      const existingScreen = document.getElementById(this.blockedScreenId);
      if (existingScreen) {
        existingScreen.remove();
      }

      // Restore main content if it was hidden
      if (this.hiddenMainContent) {
        this.showElements(this.hiddenMainContent);
        this.hiddenMainContent = null;
      }
    }
  }

  onCleanup() {
    super.onCleanup();

    // Remove blocked screen
    const existingScreen = document.getElementById(this.blockedScreenId);
    if (existingScreen) {
      existingScreen.remove();
    }

    // Restore all hidden reels links
    if (this.hiddenReelsLinks.size > 0) {
      this.hiddenReelsLinks.forEach(link => {
        if (link && link.style) {
          link.style.display = '';
        }
      });
      this.hiddenReelsLinks.clear();
    }

    // Restore main content if it was hidden
    if (this.hiddenMainContent) {
      this.showElements(this.hiddenMainContent);
      this.hiddenMainContent = null;
    }
  }
}
