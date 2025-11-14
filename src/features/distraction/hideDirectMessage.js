/**
 * HideDirectMessage - Hides Direct Message navigation link and optionally blocks direct page
 */
class HideDirectMessage extends BaseDistraction {
  constructor() {
    super();
    this.blockDirectScreen = true;
    this.hideFloatingButton = true;
    this.disableMessageButton = false;
    this.blockedScreenId = 'instabits-direct-blocked-screen';
    this.setupMessageListener();
  }

  async initialize() {
    await this.loadSettings();
    super.initialize();
  }

  async loadSettings() {
    try {
      this.blockDirectScreen = await storageService.getUserPreference('blockDirectScreen', true);
      this.hideFloatingButton = await storageService.getUserPreference('hideFloatingButton', true);
      this.disableMessageButton = await storageService.getUserPreference('disableMessageButton', false);
    } catch (error) {
      console.error('HideDirectMessage: Error loading settings:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'updateHideDirectMessageSettings') {
        if (message.blockDirectScreen !== undefined) {
          this.blockDirectScreen = message.blockDirectScreen;
        }
        if (message.hideFloatingButton !== undefined) {
          this.hideFloatingButton = message.hideFloatingButton;
        }
        if (message.disableMessageButton !== undefined) {
          this.disableMessageButton = message.disableMessageButton;
        }
        // Re-run hideDistraction to apply new settings
        this.hideDistraction();
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
      title: 'Direct Messages Blocked',
      description: "You've blocked Direct Messages to stay focused. Take a break or disable this feature in settings.",
      buttonText,
      buttonUrl,
      iconSvg: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="3" y1="3" x2="21" y2="21" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
    });
  }

  async hideDistraction() {
    const path = this.getCurrentPath();

    // Hide all direct message links
    const directLinks = document.body?.querySelectorAll('a[href="/direct/inbox/"]');
    this.hideElements(directLinks);

    // Hide floating chat button
    if (this.hideFloatingButton) {
      const floatingButton = document.querySelector('[data-pagelet="IGDChatTabsRootContent"]');
      if (floatingButton) {
        floatingButton.style.display = "none";
      }
    } else {
      const floatingButton = document.querySelector('[data-pagelet="IGDChatTabsRootContent"]');
      if (floatingButton) {
        floatingButton.style.display = "";
      }
    }

    // Disable message button on profiles
    if (this.disableMessageButton) {
      const messageBtn = Array.from(document.querySelectorAll('[role="button"]'))
        .find(el => el.textContent.trim() === "Message");

      if (messageBtn) {
        messageBtn.textContent = "Message Disabled by Instabits";
        messageBtn.style.pointerEvents = "none";
        messageBtn.style.opacity = "0.8";
        messageBtn.style.cursor = "not-allowed";
      }
    }

    // Check if we're on the direct messages page
    if (path.includes('/direct')) {
      if (this.blockDirectScreen) {
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

    // Restore floating button
    const floatingButton = document.querySelector('[data-pagelet="IGDChatTabsRootContent"]');
    if (floatingButton) {
      floatingButton.style.display = "";
    }
  }
}
