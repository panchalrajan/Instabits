/**
 * HideThreads - Hides Threads navigation link
 */
class HideThreads extends BaseDistraction {
  constructor() {
    super();
  }

  hideDistraction() {
    // Hide Threads navigation link
    const threadsLinks = document.body?.querySelectorAll('a[href*="threads"]');
    this.hideElements(threadsLinks);
  }
}
