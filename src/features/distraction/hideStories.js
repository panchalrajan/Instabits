/**
 * HideStories - Hides Stories feed on home page and stories screen
 */
class HideStories extends BaseDistraction {
  constructor() {
    super();
  }

  hideDistraction() {
    const path = this.getCurrentPath();

    // Hide story feed on home page
    if (path === '/') {
      const storyFeed = document.body?.querySelector('div[data-pagelet="story_tray"]');
      this.hideElements(storyFeed);
    }

    // Hide entire stories screen
    if (path.includes('/stories')) {
      this.hideElements(document.body);
    }
  }
}
