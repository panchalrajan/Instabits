/**
 * ForceFollowing - Forces users to focus on their Following feed
 * Blocks Reels and Explore pages, redirecting to Following feed
 */
class ForceFollowing extends BaseDistraction {
  constructor() {
    super();
    this.reelsBlockedScreenId = 'instabits-force-following-reels-blocked';
    this.exploreBlockedScreenId = 'instabits-force-following-explore-blocked';
  }

  createBlockedScreen(pageType) {
    const config = {
      reels: {
        id: this.reelsBlockedScreenId,
        title: 'Reels Blocked',
        description: 'Force Following mode is active. Focus on content from people you follow.'
      },
      explore: {
        id: this.exploreBlockedScreenId,
        title: 'Explore Blocked',
        description: 'Force Following mode is active. Focus on content from people you follow.'
      }
    };

    const { id, title, description } = config[pageType];

    return this.createBlockedScreenComponent({
      id,
      title,
      description,
      buttonText: 'Go to Following Feed',
      buttonUrl: '/',
      iconSvg: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke-width="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `
    });
  }

  hideDistraction() {
    const path = this.getCurrentPath();

    // Hide Reels and Explore navigation links
    const reelsLinks = document.body?.querySelectorAll('a[href*="/reels/"]');
    const exploreLinks = document.body?.querySelectorAll('a[href*="/explore/"]');
    this.hideElements(reelsLinks);
    this.hideElements(exploreLinks);

    // Handle Reels page blocking
    if (path.includes('/reels')) {
      const mainContent = document.body?.querySelector('[role="main"]');
      this.hideElements(mainContent);

      if (!document.getElementById(this.reelsBlockedScreenId)) {
        const blockedScreen = this.createBlockedScreen('reels');
        document.body.appendChild(blockedScreen);
      }

      // Remove explore blocked screen if present
      const exploreScreen = document.getElementById(this.exploreBlockedScreenId);
      if (exploreScreen) {
        exploreScreen.remove();
      }
    }
    // Handle Explore page blocking
    else if (path.includes('/explore')) {
      const mainContent = document.body?.querySelector('[role="main"]');
      this.hideElements(mainContent);

      if (!document.getElementById(this.exploreBlockedScreenId)) {
        const blockedScreen = this.createBlockedScreen('explore');
        document.body.appendChild(blockedScreen);
      }

      // Remove reels blocked screen if present
      const reelsScreen = document.getElementById(this.reelsBlockedScreenId);
      if (reelsScreen) {
        reelsScreen.remove();
      }
    }
    // Remove both blocked screens if on other pages (homepage, following feed, etc.)
    else {
      const reelsScreen = document.getElementById(this.reelsBlockedScreenId);
      const exploreScreen = document.getElementById(this.exploreBlockedScreenId);

      if (reelsScreen) {
        reelsScreen.remove();
      }
      if (exploreScreen) {
        exploreScreen.remove();
      }
    }
  }
}
