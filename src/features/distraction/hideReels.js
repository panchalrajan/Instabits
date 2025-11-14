/**
 * HideReels - Hides Reels navigation link and optionally blocks reels page
 */
class HideReels extends BaseDistraction {
  constructor() {
    super();
    this.blockReelsScreen = true;
    this.blockedScreenId = 'instabits-reels-blocked-screen';
    this.setupMessageListener();
  }

  async initialize() {
    await this.loadSettings();
    super.initialize();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get('pref_blockReelsScreen');
      this.blockReelsScreen = result.pref_blockReelsScreen !== undefined ? result.pref_blockReelsScreen : true;
    } catch (error) {
      console.error('HideReels: Error loading settings:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'updateHideReelsSettings') {
        if (message.blockReelsScreen !== undefined) {
          this.blockReelsScreen = message.blockReelsScreen;
        }
      }
    });
  }

  async isForceFollowingEnabled() {
    try {
      const result = await chrome.storage.sync.get('instabits_feature_forceFollowing');
      return result.instabits_feature_forceFollowing === true;
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

    const reelsLinks = document.body?.querySelectorAll('a[href*="/reels/"]');
    this.hideElements(reelsLinks);

    if (path.includes('/reels')) {
      if (this.blockReelsScreen) {
        const mainContent = document.body?.querySelector('[role="main"]');
        this.hideElements(mainContent);

        if (!document.getElementById(this.blockedScreenId)) {
          const blockedScreen = await this.createBlockedScreen();
          document.body.appendChild(blockedScreen);
        }
      } else {
        const existingScreen = document.getElementById(this.blockedScreenId);
        if (existingScreen) {
          existingScreen.remove();
        }
      }
    } else {
      const existingScreen = document.getElementById(this.blockedScreenId);
      if (existingScreen) {
        existingScreen.remove();
      }
    }
  }

  onCleanup() {
    super.onCleanup();

    const existingScreen = document.getElementById(this.blockedScreenId);
    if (existingScreen) {
      existingScreen.remove();
    }
  }
}
