/**
 * VideoControlsManager - Centralized manager for video control UI elements
 *
 * Uses flexbox for automatic layout and spacing.
 *
 * Manages:
 * - Playback Speed button
 * - PIP Mode button
 * - Fullscreen button
 * - Video Duration display
 *
 * Benefits:
 * - Auto spacing with flexbox gap
 * - No overlapping elements
 * - Automatic repositioning when features are enabled/disabled
 * - Elements automatically fill space when others are removed
 */
class VideoControlsManager {
  constructor() {
    // Track containers per video
    this.videoContainers = new WeakMap();

    // Element order (left to right due to flex-direction: row)
    // Order in array = visual order from left to right
    this.elementOrder = [
      'fullscreen',      // Leftmost
      'playbackSpeed',
      'pipMode',
      'videoDuration'    // Rightmost
    ];
  }

  /**
   * Get or create container for a video
   */
  getContainer(video) {
    let container = this.videoContainers.get(video);

    if (!container) {
      container = this.createContainer(video);
      this.videoContainers.set(video, container);
    }

    return container;
  }

  /**
   * Create the controls container
   */
  createContainer(video) {
    const videoParent = video.parentElement;
    if (!videoParent) return null;

    // Create container
    const container = document.createElement('div');
    container.className = 'insta-video-controls-container';

    // Check if reels view
    if (navigationTracker.isReelsFeed()) {
      container.classList.add('reels-view');
    }

    // Append to video parent
    videoParent.appendChild(container);

    return {
      element: container,
      elements: new Map(), // Store registered elements by type
      videoParent: videoParent
    };
  }

  /**
   * Register a control element
   */
  registerElement(video, type, element) {
    const container = this.getContainer(video);
    if (!container) return false;

    // Store element
    container.elements.set(type, element);

    // Set order attribute for flexbox ordering
    const orderIndex = this.elementOrder.indexOf(type);
    if (orderIndex !== -1) {
      element.style.order = orderIndex;
    }

    // Append to container (flexbox handles positioning)
    container.element.appendChild(element);

    return true;
  }

  /**
   * Unregister a control element
   */
  unregisterElement(video, type) {
    const container = this.videoContainers.get(video);
    if (!container) return;

    const element = container.elements.get(type);
    if (element && element.parentNode) {
      element.remove();
    }

    container.elements.delete(type);
    // Flexbox automatically reflows remaining elements
  }

  /**
   * Remove container for a video
   */
  removeContainer(video) {
    const container = this.videoContainers.get(video);
    if (!container) return;

    if (container.element && container.element.parentNode) {
      container.element.remove();
    }

    this.videoContainers.delete(video);
  }

  /**
   * Check if a video has a container
   */
  hasContainer(video) {
    return this.videoContainers.has(video);
  }

  /**
   * Get element from container
   */
  getElement(video, type) {
    const container = this.videoContainers.get(video);
    if (!container) return null;
    return container.elements.get(type);
  }
}

// Create global instance
const videoControlsManager = new VideoControlsManager();
