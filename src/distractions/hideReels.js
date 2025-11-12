/**
 * HideReels - Hides Reels navigation link and Reels screen
 * Redirects to homepage if user tries to access Reels
 */
class HideReels extends BaseDistraction {
  constructor() {
    super();
  }

  hideDistraction() {
    const path = this.getCurrentPath();

    // Hide Reels navigation link
    const reelsLinks = document.body?.querySelectorAll('a[href*="/reels/"]');
    this.hideElements(reelsLinks);

    // Hide entire Reels screen if on reels page
    if (path.includes('/reels')) {
      const mainContent = document.body?.querySelector('[role="main"]');
      this.hideElements(mainContent);
    }
  }
}
