/**
 * HideSuggestedFollowers - Hides suggested followers section on home page
 */
class HideSuggestedFollowers extends BaseDistraction {
  constructor() {
    super();
  }

  hideDistraction() {
    const path = this.getCurrentPath();

    // Only hide on home page
    if (path === '/') {
      // Find the "Suggested for you" link
      const suggestedLink = document.body?.querySelector('a[href*="/explore/people/"]');

      if (suggestedLink) {
        // Hide the link itself
        this.hideElements(suggestedLink);

        // Hide the title container (usually the parent div)
        const titleContainer = suggestedLink.closest('div');
        this.hideElements(titleContainer);

        // Hide the suggested followers list (next sibling of title)
        if (titleContainer) {
          const suggestedList = titleContainer.nextElementSibling;
          this.hideElements(suggestedList);
        }
      }
    }
  }
}
