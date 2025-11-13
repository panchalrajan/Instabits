/**
 * ForceFollowing - Forces users to focus on their Following feed
 * Blocks Homepage only, redirecting to Following feed
 * Works with Hide Reels and Hide Explore to provide consistent CTA
 */
class ForceFollowing extends BaseDistraction {
  constructor() {
    super();
    this.homepageBlockedScreenId = 'instabits-force-following-homepage-blocked';
  }

  createBlockedScreen() {
    return this.createBlockedScreenComponent({
      id: this.homepageBlockedScreenId,
      title: 'Focus on Following',
      description: 'Focus on Following mode is active. Stay focused on content from people you follow.',
      buttonText: 'Go to Following Feed',
      buttonUrl: '/?variant=following',
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
    const urlParams = new URLSearchParams(window.location.search);
    const variant = urlParams.get('variant');

    // Check if we're on homepage (but not following feed)
    const isHomepage = path === '/' && variant !== 'following';

    // Only block Homepage when on homepage (not following feed)
    // Reels and Explore are NOT blocked by this feature
    // They are handled by their respective Hide Reels and Hide Explore features
    if (isHomepage) {
      const mainContent = document.body?.querySelector('[role="main"]');
      this.hideElements(mainContent);

      if (!document.getElementById(this.homepageBlockedScreenId)) {
        const blockedScreen = this.createBlockedScreen();
        document.body.appendChild(blockedScreen);
      }
    } else {
      // Remove blocked screen if not on homepage
      const existingScreen = document.getElementById(this.homepageBlockedScreenId);
      if (existingScreen) {
        existingScreen.remove();
      }
    }
  }
}
