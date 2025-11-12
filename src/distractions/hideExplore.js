/**
 * HideExplore - Hides Explore navigation link and Explore screen
 * Redirects to homepage if user tries to access Explore
 */
class HideExplore extends BaseDistraction {
  constructor() {
    super();
  }

  hideDistraction() {
    const path = this.getCurrentPath();

    // Hide Explore navigation link
    const exploreLinks = document.body?.querySelectorAll('a[href*="/explore/"]');
    this.hideElements(exploreLinks);

    // Hide entire Explore screen if on explore page
    if (path.includes('/explore')) {
      const mainContent = document.body?.querySelector('[role="main"]');
      this.hideElements(mainContent);
    }
  }
}
