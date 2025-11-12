/**
 * HideExplore - Hides Explore navigation link and shows blocked screen
 */
class HideExplore extends BaseDistraction {
  constructor() {
    super();
    this.blockedScreenId = 'instabits-explore-blocked-screen';
  }

  createBlockedScreen() {
    return this.createBlockedScreenComponent({
      id: this.blockedScreenId,
      title: 'Explore Blocked',
      description: "You've blocked Explore to stay focused. Take a break or disable this feature in settings.",
      iconSvg: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="2"/>
          <path d="M8 14l2-6 6-2-2 6-6 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
    });
  }

  hideDistraction() {
    const path = this.getCurrentPath();

    // Hide Explore navigation link
    const exploreLinks = document.body?.querySelectorAll('a[href*="/explore/"]');
    this.hideElements(exploreLinks);

    // Show blocked screen if on explore page
    if (path.includes('/explore')) {
      // Hide main content
      const mainContent = document.body?.querySelector('[role="main"]');
      this.hideElements(mainContent);

      // Show blocked screen if not already present
      if (!document.getElementById(this.blockedScreenId)) {
        const blockedScreen = this.createBlockedScreen();
        document.body.appendChild(blockedScreen);
      }
    } else {
      // Remove blocked screen if not on explore page
      const existingScreen = document.getElementById(this.blockedScreenId);
      if (existingScreen) {
        existingScreen.remove();
      }
    }
  }
}
