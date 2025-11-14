/**
 * HideStories - Hides Stories feed on home page and stories screen
 */
class HideStories extends BaseDistraction {
  constructor() {
    super();
    this.mode = 'selective'; // default mode: 'selective' or 'all'
    this.blockStoriesScreen = false; // default: don't block stories screen
    this.styleElementId = 'instabits-hide-stories-styles';
    this.blockedScreenId = 'instabits-stories-blocked-screen';
    this.setupMessageListener();
  }

  /**
   * Override initialize to load settings before starting observation
   */
  async initialize() {
    await this.loadSettings();
    super.initialize(); // This will call startObserving
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['pref_hideStoriesMode', 'pref_blockStoriesScreen']);
      this.mode = result.pref_hideStoriesMode || 'selective';
      this.blockStoriesScreen = result.pref_blockStoriesScreen || false;
      console.log('HideStories: Loaded settings:', {
        mode: this.mode,
        blockStoriesScreen: this.blockStoriesScreen
      });
      this.applyMode();
    } catch (error) {
      console.error('HideStories: Error loading settings:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'updateHideStoriesSettings') {
        console.log('HideStories: Updating settings:', message);
        if (message.mode !== undefined) {
          this.mode = message.mode;
        }
        if (message.blockStoriesScreen !== undefined) {
          this.blockStoriesScreen = message.blockStoriesScreen;
        }
        this.applyMode();
      }
      // Legacy support for old message type
      if (message.type === 'updateHideStoriesMode' && message.mode) {
        console.log('HideStories: Updating mode to:', message.mode);
        this.mode = message.mode;
        this.applyMode();
      }
    });
  }

  /**
   * Check if Focus on Following feature is enabled
   * @returns {Promise<boolean>}
   */
  async isForceFollowingEnabled() {
    try {
      const result = await chrome.storage.sync.get('instabits_feature_forceFollowing');
      return result.instabits_feature_forceFollowing === true;
    } catch (error) {
      console.error('HideStories: Error checking forceFollowing state:', error);
      return false;
    }
  }

  async createBlockedScreen() {
    // Check if Focus on Following is enabled
    const forceFollowingEnabled = await this.isForceFollowingEnabled();

    // If Focus on Following is enabled, redirect to following feed
    // Otherwise, redirect to homepage
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

  applyMode() {
    console.log('HideStories: Applying mode:', this.mode);

    // Remove any existing style injection
    const existingStyle = document.getElementById(this.styleElementId);
    if (existingStyle) {
      existingStyle.remove();
    }

    if (this.mode === 'all') {
      this.injectHideAllStylesheet();
    }
    // For 'selective' mode, use the DOM-based hiding in hideDistraction()
  }

  injectHideAllStylesheet() {
    console.log('HideStories: Injecting Hide All stylesheet');
    // Create style element for hiding all stories across Instagram
    const style = document.createElement('style');
    style.id = this.styleElementId;

    // Note: If blockStoriesScreen is false, we want to allow /stories page to be accessible
    // The CSS below hides story elements everywhere, but the hideDistraction() method
    // will handle the /stories page separately based on blockStoriesScreen setting

    style.textContent = `
      /* Hide Stories - All Mode */
      /* Story tray on home page */
      main .xmnaoh6 > [data-pagelet="story_tray"],
      div[data-pagelet="story_tray"] {
        display: none !important;
      }

      /* Story circles/avatars */
      .x9f619.x1lliihq.x10wlt62.x1n2onr6.x1hq5gj4.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x1y1aw1k.x4uap5.xkhd6sd.xvbhtw8.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x178xt8z.x11wr9rl.x1e3j9e7.x120q0s9.xw7yly9.xwib8y2.x18vkjtm,
      .x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.xdj266r.x1e56ztr.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1,
      div.xw7yly9 div.x18dvoc8,
      div > ._aac4._aac6._aj3f._ajdu {
        display: none !important;
      }

      /* Story canvas elements */
      canvas._aarh,
      canvas._aarh + span::before,
      canvas._aarh[width="132"] + span::before,
      canvas._aarh[width="336"] + span::before,
      canvas._aarh[width="84"] + span::before,
      canvas.x1upo8f9.xpdipgo.x87ps6o,
      canvas.x1upo8f9.xpdipgo.x87ps6o + span::after,
      canvas.x1upo8f9.xpdipgo.x87ps6o + span::before {
        display: none !important;
        pointer-events: none !important;
        user-select: none !important;
      }

      /* Story menu items */
      .xzzrveb.x1h862dm.xjk3ia2.x1tb5o9v[role="menu"],
      [role="menu"] .x1qo8xr2.x129qt2x.xpoid6y.xx7atzb,
      section.xc3tme8.xcrlgei.xtyw845.x1682tcd > div[role="menu"] {
        display: none !important;
      }

      /* Story buttons */
      [role="button"]:has(canvas.x1upo8f9.xpdipgo.x87ps6o) {
        pointer-events: none !important;
        user-select: none !important;
      }

      /* Story containers */
      .x4afe7t.x1v7wizp.x1htlvfj.x1a5igra.xds687c.xixxii4.x17qophe.x13vifvy.x1x85hfe.x1s85apg {
        display: none !important;
      }

      /* Mobile adjustments */
      @media only screen and (max-width: 640px) {
        [role="menu"].x1qjc9v5.x78zum5.xdt5ytf.x17j7krd {
          display: none !important;
        }
        [role="menu"].x1qjc9v5.x78zum5.xdt5ytf.x17j7krd + * {
          margin-top: -2rem;
        }
        .xmnaoh6 {
          margin-bottom: 0 !important;
        }
      }
    `;

    document.head.appendChild(style);
    console.log('HideStories: Stylesheet injected successfully. Element ID:', this.styleElementId);
  }

  async hideDistraction() {
    const path = this.getCurrentPath();

    // Handle /stories page
    if (path.includes('/stories')) {
      if (this.blockStoriesScreen) {
        // Block Stories Screen is ENABLED - show blocked screen
        // Hide main content
        const mainContent = document.body?.querySelector('[role="main"]');
        this.hideElements(mainContent);

        // Show blocked screen if not already present
        if (!document.getElementById(this.blockedScreenId)) {
          const blockedScreen = await this.createBlockedScreen();
          document.body.appendChild(blockedScreen);
        }
        return; // Don't apply other hiding logic
      } else {
        // Block Stories Screen is DISABLED - user can access /stories normally
        // Remove blocked screen if present
        const existingScreen = document.getElementById(this.blockedScreenId);
        if (existingScreen) {
          existingScreen.remove();
        }

        // If in "Hide All Stories" mode, we need to temporarily unhide content on /stories page
        // so user can access it (since CSS hides everything globally)
        if (this.mode === 'all') {
          const mainContent = document.body?.querySelector('[role="main"]');
          if (mainContent) {
            this.showElements(mainContent);
          }
          // Also make sure body is visible
          if (document.body) {
            this.showElements(document.body);
          }
        }

        // Don't hide anything on /stories page - let user access it
        return;
      }
    } else {
      // Not on stories page - remove blocked screen if present
      const existingScreen = document.getElementById(this.blockedScreenId);
      if (existingScreen) {
        existingScreen.remove();
      }
    }

    // Apply selective mode DOM-based hiding on home page
    if (this.mode === 'selective') {
      // Hide story feed on home page
      if (path === '/') {
        const storyFeed = document.body?.querySelector('div[data-pagelet="story_tray"]');
        this.hideElements(storyFeed);
      }
    }
    // For 'all' mode, CSS injection handles everything
  }

  onCleanup() {
    super.onCleanup();
    // Remove injected stylesheet
    const existingStyle = document.getElementById(this.styleElementId);
    if (existingStyle) {
      existingStyle.remove();
    }
    // Remove blocked screen
    const existingScreen = document.getElementById(this.blockedScreenId);
    if (existingScreen) {
      existingScreen.remove();
    }
  }
}
