/**
 * GrayscaleMode - Converts the entire Instagram page to grayscale
 *
 * This feature applies a grayscale filter to all visual media (images, videos, canvas)
 * on Instagram to reduce visual stimulation and distractions from colorful content.
 *
 * Works on:
 * - All Instagram pages
 *
 * Dynamic behavior:
 * - Can be enabled/disabled without page refresh
 * - Works across all active Instagram tabs automatically
 * - Uses CSS-based filtering for instant grayscale effect
 *
 * Note: Some UI elements or dynamically loaded content may retain colors.
 * This is expected behavior and does not affect the main content.
 */
class GrayscaleMode {
  constructor() {
    this.enabled = true;
    this.styleElement = null;
    this.grayscaleClass = 'instabits-grayscale-active';
    this.init();
  }

  init() {
    // Create and inject style element for grayscale effect
    this.createStyleElement();

    // Apply grayscale if enabled
    if (this.enabled) {
      this.applyGrayscale();
    }
  }

  /**
   * Create a style element with grayscale CSS rules
   */
  createStyleElement() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'instabits-grayscale-mode';
    this.styleElement.textContent = `
      /* Apply grayscale filter to all visual media when class is active */
      html.${this.grayscaleClass} canvas,
      html.${this.grayscaleClass} img,
      html.${this.grayscaleClass} video {
        -webkit-filter: grayscale(1) !important;
        filter: grayscale(1) !important;
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  /**
   * Apply grayscale effect by adding class to html element
   */
  applyGrayscale() {
    const htmlElement = document.documentElement;
    if (!htmlElement.classList.contains(this.grayscaleClass)) {
      htmlElement.classList.add(this.grayscaleClass);
    }
  }

  /**
   * Remove grayscale effect by removing class from html element
   */
  removeGrayscale() {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove(this.grayscaleClass);
  }

  /**
   * Enable the feature
   */
  enable() {
    this.enabled = true;
    this.applyGrayscale();
  }

  /**
   * Disable the feature
   */
  disable() {
    this.enabled = false;
    this.removeGrayscale();
  }

  /**
   * Process all videos - compatibility with FeatureManager pattern
   */
  processAllVideos() {
    // This method is called by FeatureManager for pattern compatibility
    // Grayscale is applied globally via CSS class, so nothing to do here
    if (this.enabled) {
      this.applyGrayscale();
    }
  }

  /**
   * Cleanup when feature is disabled or unloaded
   */
  cleanup() {
    // Remove grayscale class
    this.removeGrayscale();

    // Remove style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }
}
