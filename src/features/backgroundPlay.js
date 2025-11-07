class BackgroundPlay {
  constructor() {
    this.enabled = true;
    this.init();
  }

  init() {
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible'
    });

    Object.defineProperty(document, 'hidden', {
      get: () => false
    });

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
