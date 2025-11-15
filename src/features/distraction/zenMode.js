class ZenMode extends BaseFeature {
  constructor() {
    super();
  }

  initialize() {
    this.hideClass = 'instabits-zen-hidden';
    this.injectStyles();
  }

  injectStyles() {
    // Inject CSS to hide overlays in zen mode
    if (!document.getElementById('instabits-zen-styles')) {
      const style = document.createElement('style');
      style.id = 'instabits-zen-styles';
      style.textContent = `
        .instabits-zen-hidden {
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.2s ease !important;
        }

        .instabits-zen-visible {
          opacity: 1 !important;
          pointer-events: auto !important;
          transition: opacity 0.2s ease !important;
        }

        /* Hide our custom UI elements in zen mode */
        .instabits-zen-hide-controls .insta-speed-button,
        .instabits-zen-hide-controls .insta-pip-button,
        .instabits-zen-hide-controls .insta-video-duration-overlay,
        .instabits-zen-hide-controls .insta-fullscreen-button,
        .instabits-zen-hide-controls .insta-volume-slider-container {
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.2s ease !important;
        }

        /* Show controls on hover */
        .instabits-zen-show-controls .insta-speed-button,
        .instabits-zen-show-controls .insta-pip-button,
        .instabits-zen-show-controls .insta-video-duration-overlay,
        .instabits-zen-show-controls .insta-fullscreen-button,
        .instabits-zen-show-controls .insta-volume-slider-container {
          opacity: 1 !important;
          pointer-events: auto !important;
          transition: opacity 0.2s ease !important;
        }

        /* Speed overlay should remain hidden unless button is hovered */
        .instabits-zen-hide-controls .insta-speed-overlay {
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Don't force show speed overlay on video hover - let button handle it */
        .instabits-zen-show-controls .insta-speed-overlay {
          /* Removed: Let the speed button's own hover logic control this */
        }

        /* Keep seekbar always visible - don't hide it */
      `;
      document.head.appendChild(style);
    }
  }

  findOverlayDiv(video) {
    // Find the parent container
    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    // Find the overlay div - it's the sibling div with data-instancekey
    const siblings = Array.from(videoParent.children);

    for (const sibling of siblings) {
      // Look for div with data-instancekey attribute
      if (sibling.tagName === 'DIV' &&
          sibling !== video &&
          sibling.hasAttribute('data-instancekey')) {
        return sibling;
      }
    }

    return null;
  }

  processVideo(video) {
    if (!video || this.isVideoTracked(video)) {
      return null;
    }

    const overlayDiv = this.findOverlayDiv(video);
    if (!overlayDiv) {
      return null;
    }

    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    // Initially hide the overlay and our custom controls
    overlayDiv.classList.add(this.hideClass);
    videoParent.classList.add('instabits-zen-hide-controls');

    // Track this video
    this.addToTrackedVideos(video, { overlayDiv });

    // Mouse enter on video parent - show overlay and controls
    const handleMouseEnter = () => {
      overlayDiv.classList.remove(this.hideClass);
      overlayDiv.classList.add('instabits-zen-visible');
      videoParent.classList.remove('instabits-zen-hide-controls');
      videoParent.classList.add('instabits-zen-show-controls');
    };

    // Mouse leave from video parent - hide overlay and controls
    const handleMouseLeave = () => {
      overlayDiv.classList.remove('instabits-zen-visible');
      overlayDiv.classList.add(this.hideClass);
      videoParent.classList.remove('instabits-zen-show-controls');
      videoParent.classList.add('instabits-zen-hide-controls');
    };

    videoParent.addEventListener('mouseenter', handleMouseEnter);
    videoParent.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup on video removal
    this.setupCleanupObserver(video, () => {
      videoParent.removeEventListener('mouseenter', handleMouseEnter);
      videoParent.removeEventListener('mouseleave', handleMouseLeave);

      // Restore overlay and controls visibility
      overlayDiv.classList.remove(this.hideClass);
      overlayDiv.classList.remove('instabits-zen-visible');
      videoParent.classList.remove('instabits-zen-hide-controls');
      videoParent.classList.remove('instabits-zen-show-controls');
    });

    return { overlayDiv };
  }

  onCleanup() {
    // Remove injected styles
    const styleElement = document.getElementById('instabits-zen-styles');
    if (styleElement) {
      styleElement.remove();
    }

    // Restore all overlays and controls
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      const tracked = this.getTrackedData(video);
      if (tracked && tracked.overlayDiv) {
        tracked.overlayDiv.classList.remove(this.hideClass);
        tracked.overlayDiv.classList.remove('instabits-zen-visible');
      }

      const videoParent = this.getVideoParent(video);
      if (videoParent) {
        videoParent.classList.remove('instabits-zen-hide-controls');
        videoParent.classList.remove('instabits-zen-show-controls');
      }
    });
  }
}
