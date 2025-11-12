/**
 * HideReels - Hides Reels navigation link and shows blocked screen
 */
class HideReels extends BaseDistraction {
  constructor() {
    super();
    this.blockedScreenId = 'instabits-reels-blocked-screen';
  }

  createBlockedScreen() {
    return this.createBlockedScreenComponent({
      id: this.blockedScreenId,
      title: 'Reels Blocked',
      description: "You've blocked Reels to stay focused. Take a break or disable this feature in settings.",
      iconSvg: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="2" y="6" width="20" height="12" rx="2" stroke-width="2"/>
          <path d="M2 6l6 6M8 6l-6 6M16 6l6 6M22 6l-6 6" stroke-width="2" stroke-linecap="round"/>
          <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
    });
  }

  hideDistraction() {
    const path = this.getCurrentPath();

    // Hide Reels navigation link
    const reelsLinks = document.body?.querySelectorAll('a[href*="/reels/"]');
    this.hideElements(reelsLinks);

    // Show blocked screen if on reels page
    if (path.includes('/reels')) {
      // Hide main content
      const mainContent = document.body?.querySelector('[role="main"]');
      this.hideElements(mainContent);

      // Show blocked screen if not already present
      if (!document.getElementById(this.blockedScreenId)) {
        const blockedScreen = this.createBlockedScreen();
        document.body.appendChild(blockedScreen);
      }
    } else {
      // Remove blocked screen if not on reels page
      const existingScreen = document.getElementById(this.blockedScreenId);
      if (existingScreen) {
        existingScreen.remove();
      }
    }
  }
}
