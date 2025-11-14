/**
 * HideStories - Hides Stories based on user preferences
 *
 * Scenarios:
 * 1. Feature OFF: Nothing hidden
 * 2. Tray Only + HSP OFF: Hide tray only, stories page accessible
 * 3. All + HSP OFF: Hide tray + rings, stories page accessible
 * 4. Tray Only + HSP ON: Hide tray, block stories page
 * 5. All + HSP ON: Hide tray + rings, block stories page
 */
class HideStories extends BaseDistraction {
  constructor() {
    super();
    this.mode = 'selective'; // 'selective' = Tray Only, 'all' = All
    this.blockStoriesScreen = false; // HSP setting
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
      this.applyMode();
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
        this.applyMode();
      }
    });
  }

  applyMode() {
    // Remove any existing style injection
    const existingStyle = document.getElementById(this.styleElementId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Inject CSS only for 'all' mode to hide story rings/avatars
    if (this.mode === 'all') {
      this.injectStoryRingsStylesheet();
    }
  }

  injectStoryRingsStylesheet() {
    const style = document.createElement('style');
    style.id = this.styleElementId;

    // Hide story rings/avatars/buttons (profile story circles)
    // Note: Story tray is handled separately via DOM in hideDistraction()
    style.textContent = `
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
  }

  /**
   * Check if Focus on Following feature is enabled
   */
  async isForceFollowingEnabled() {
    try {
      const result = await chrome.storage.sync.get('instabits_feature_forceFollowing');
      return result.instabits_feature_forceFollowing === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create blocked screen for /stories page
   */
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

    // === HANDLE /stories PAGE ===
    if (path.includes('/stories')) {
      if (this.blockStoriesScreen) {
        // HSP ON: Show blocked screen
        const mainContent = document.body?.querySelector('[role="main"]');
        this.hideElements(mainContent);

        if (!document.getElementById(this.blockedScreenId)) {
          const blockedScreen = await this.createBlockedScreen();
          document.body.appendChild(blockedScreen);
        }
      } else {
        // HSP OFF: Allow access to /stories page
        const existingScreen = document.getElementById(this.blockedScreenId);
        if (existingScreen) {
          existingScreen.remove();
        }

        // In 'all' mode, unhide content on /stories page (CSS hides globally)
        if (this.mode === 'all') {
          const mainContent = document.body?.querySelector('[role="main"]');
          if (mainContent) {
            this.showElements(mainContent);
          }
          if (document.body) {
            this.showElements(document.body);
          }
        }
      }
      return; // Don't process other hiding logic on /stories page
    }

    // Remove blocked screen if not on /stories page
    const existingScreen = document.getElementById(this.blockedScreenId);
    if (existingScreen) {
      existingScreen.remove();
    }

    // === HIDE STORY TRAY ON HOME PAGE ===
    // Works for both 'selective' (Tray Only) and 'all' modes
    // Uses existing DOM-based hiding from original implementation
    if (path === '/') {
      const storyFeed = document.body?.querySelector('div[data-pagelet="story_tray"]');
      this.hideElements(storyFeed);
    }

    // === HIDE STORY RINGS/AVATARS ===
    // Handled by CSS injection in 'all' mode (via applyMode)
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
