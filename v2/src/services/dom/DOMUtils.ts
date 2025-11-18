/**
 * DOM Utilities Service
 * Provides common DOM manipulation utilities
 * Single Responsibility Principle
 */

import type { IDOMUtils, ElementOptions } from '@app-types';
import type { ILogger } from '@app-types';

export class DOMUtils implements IDOMUtils {
  private static instance: DOMUtils;
  private logger: ILogger;

  private constructor(logger: ILogger) {
    this.logger = logger;
  }

  static getInstance(logger: ILogger): DOMUtils {
    if (!DOMUtils.instance) {
      DOMUtils.instance = new DOMUtils(logger);
    }
    return DOMUtils.instance;
  }

  /**
   * Create an element with options
   */
  createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: ElementOptions
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (!options) {
      return element;
    }

    // Set basic properties
    if (options.className) {
      element.className = options.className;
    }

    if (options.id) {
      element.id = options.id;
    }

    if (options.textContent) {
      element.textContent = options.textContent;
    }

    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }

    // Set attributes
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    // Set styles
    if (options.styles) {
      Object.entries(options.styles).forEach(([key, value]) => {
        if (value !== undefined) {
          (element.style as unknown as Record<string, string>)[key] = value as string;
        }
      });
    }

    // Append children
    if (options.children) {
      options.children.forEach((child) => {
        element.appendChild(child);
      });
    }

    // Add event listeners
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }

    return element;
  }

  /**
   * Find video element in or above given element
   */
  findVideo(element: Element): HTMLVideoElement | null {
    // Check if element is video
    if (element instanceof HTMLVideoElement) {
      return element;
    }

    // Search within element
    const video = element.querySelector('video');
    if (video) {
      return video;
    }

    // Search in parent
    const parent = element.parentElement;
    if (parent) {
      return this.findVideo(parent);
    }

    return null;
  }

  /**
   * Find all video elements
   */
  findAllVideos(root: Element = document.body): HTMLVideoElement[] {
    return Array.from(root.querySelectorAll('video'));
  }

  /**
   * Wait for element to appear
   */
  async waitForElement(
    selector: string,
    timeout = 5000
  ): Promise<Element | null> {
    // Check if already exists
    const existing = document.querySelector(selector);
    if (existing) {
      return existing;
    }

    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Timeout
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        this.logger.warn(`Element not found within timeout: ${selector}`);
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Check if element is visible
   */
  isElementVisible(element: Element): boolean {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetParent !== null
    );
  }

  /**
   * Check if element is in viewport
   */
  isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }

  /**
   * Ensure parent element is positioned (for absolute children)
   */
  ensureParentPositioned(parent: HTMLElement): void {
    const position = window.getComputedStyle(parent).position;
    if (position === 'static') {
      parent.style.position = 'relative';
    }
  }

  /**
   * Remove element safely
   */
  removeElement(element: Element): void {
    try {
      element.remove();
    } catch (error) {
      this.logger.error('Error removing element', error as Error);
    }
  }

  /**
   * Add class safely
   */
  addClass(element: Element, className: string): void {
    try {
      element.classList.add(className);
    } catch (error) {
      this.logger.error('Error adding class', error as Error);
    }
  }

  /**
   * Remove class safely
   */
  removeClass(element: Element, className: string): void {
    try {
      element.classList.remove(className);
    } catch (error) {
      this.logger.error('Error removing class', error as Error);
    }
  }

  /**
   * Toggle class safely
   */
  toggleClass(element: Element, className: string, force?: boolean): void {
    try {
      element.classList.toggle(className, force);
    } catch (error) {
      this.logger.error('Error toggling class', error as Error);
    }
  }
}
