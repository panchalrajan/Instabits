class DisableDoubleTapLike {
  constructor() {
    this.enabled = true;
    this.boundDoubleClickHandler = null;
    this.init();
  }

  init() {
    // Bind the event handler once
    this.boundDoubleClickHandler = this.handleDoubleClick.bind(this);

    // Add double-click event listener to the document
    this.addEventListeners();
  }

  addEventListeners() {
    if (!this.boundDoubleClickHandler) return;

    // Add event listener in capture phase (third parameter = true)
    // This ensures we catch the event before it reaches the target
    document.addEventListener('dblclick', this.boundDoubleClickHandler, true);
  }

  removeEventListeners() {
    if (!this.boundDoubleClickHandler) return;

    // Remove event listener
    document.removeEventListener('dblclick', this.boundDoubleClickHandler, true);
  }

  handleDoubleClick(event) {
    if (!this.enabled) return;

    // Check if the double-click occurred within a post (article element)
    const post = event.target.closest('article');

    if (post) {
      // Prevent the default double-tap to like behavior
      event.stopPropagation();
      event.preventDefault();
    }
  }

  processAllVideos() {
    // This method is called by BaseFeature pattern compatibility
    // No processing needed as this feature works globally
  }

  cleanup() {
    // Remove event listeners
    this.removeEventListeners();

    // Clear the bound handler reference
    this.boundDoubleClickHandler = null;
  }
}
