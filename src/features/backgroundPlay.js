class BackgroundPlay {
  constructor() {
    this.enabled = true;
    this.init();
  }

  init() {
    // Override visibility properties to always appear visible
    // This prevents Instagram from pausing videos when tab is hidden
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible',
      configurable: true
    });

    Object.defineProperty(document, 'hidden', {
      get: () => false,
      configurable: true
    });

    // Stop visibilitychange events from reaching Instagram's handlers
    document.addEventListener(
      'visibilitychange',
      (e) => {
        e.stopImmediatePropagation();
      },
      true
    );

    window.addEventListener(
      'blur',
      (e) => {
        e.stopImmediatePropagation();
      },
      true
    );

    setInterval(() => {
      window.dispatchEvent(new Event('mousemove'));
    }, 10000);
  }

  processAllVideos() {
    // No-op: Background play works via property overrides
  }
}
