/**
 * HideStories - Hides Stories based on user preferences
 */
class HideStories extends BaseDistraction {
  constructor() {
    super();
    this.mode = 'selective';
    this.blockStoriesScreen = false;
    this.blockedScreenId = 'instabits-stories-blocked-screen';
    this.setupMessageListener();
  }

  async initialize() {
    await this.loadSettings();
    super.initialize();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['pref_hideStoriesMode', 'pref_blockStoriesScreen']);
      this.mode = result.pref_hideStoriesMode || 'selective';
      this.blockStoriesScreen = result.pref_blockStoriesScreen || false;
    } catch (error) {
      console.error('HideStories: Error loading settings:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'updateHideStoriesSettings') {
        if (message.mode !== undefined) {
          this.mode = message.mode;
        }
        if (message.blockStoriesScreen !== undefined) {
          this.blockStoriesScreen = message.blockStoriesScreen;
        }
      }
    });
  }

  hideStoryRings() {
    document.querySelectorAll('div[role="button"]').forEach(btn => {
      const canvas = btn.querySelector('canvas');
      const profileImg = btn.querySelector('img[alt*="profile picture"]');

      if (canvas && profileImg) {
        canvas.style.display = 'none';
        btn.style.pointerEvents = 'none';
        btn.style.cursor = 'default';
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
      title: 'Stories Blocked',
      description: "You've blocked Stories to stay focused. Take a break or disable this feature in settings.",
      buttonText,
      buttonUrl,
      iconSvg: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="2"/>
          <circle cx="12" cy="12" r="3" stroke-width="2"/>
          <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
    });
  }

  async hideDistraction() {
    const path = this.getCurrentPath();

    if (path.includes('/stories')) {
      if (this.blockStoriesScreen) {
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
      return;
    }

    const existingScreen = document.getElementById(this.blockedScreenId);
    if (existingScreen) {
      existingScreen.remove();
    }

    if (path === '/') {
      const storyFeed = document.body?.querySelector('div[data-pagelet="story_tray"]');
      this.hideElements(storyFeed);
    }

    if (this.mode === 'all') {
      this.hideStoryRings();
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
