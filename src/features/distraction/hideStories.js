/**
 * HideStories - Hides Stories based on user preferences
 */
class HideStories extends BaseDistraction {
  constructor() {
    super();
    this.mode = 'selective';
    this.blockStoriesScreen = false;
    this.blockedScreenId = 'instabits-stories-blocked-screen';
    this.modifiedStoryRings = new Map(); // Track modified story rings and their original state
    this.setupMessageListener();
  }

  async initialize() {
    await this.loadSettings();
    super.initialize();
  }

  async loadSettings() {
    try {
      this.mode = await storageService.getUserPreference('hideStoriesMode', 'selective');
      this.blockStoriesScreen = await storageService.getUserPreference('blockStoriesScreen', false);
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

      if (canvas && profileImg && !this.modifiedStoryRings.has(btn)) {
        // Store original state
        this.modifiedStoryRings.set(btn, {
          canvasDisplay: canvas.style.display,
          pointerEvents: btn.style.pointerEvents,
          cursor: btn.style.cursor,
          canvas: canvas
        });

        // Modify elements
        canvas.style.display = 'none';
        btn.style.pointerEvents = 'none';
        btn.style.cursor = 'default';
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

    // Restore all modified story rings
    this.modifiedStoryRings.forEach((originalState, btn) => {
      if (btn && document.contains(btn)) {
        if (originalState.canvas && document.contains(originalState.canvas)) {
          originalState.canvas.style.display = originalState.canvasDisplay;
        }
        btn.style.pointerEvents = originalState.pointerEvents;
        btn.style.cursor = originalState.cursor;
      }
    });

    // Clear the map
    this.modifiedStoryRings.clear();
  }
}
