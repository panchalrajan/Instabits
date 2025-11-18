/**
 * DOM utility functions
 */

import { logger } from '@services/Logger';

/**
 * Create an element with attributes and styles
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    className?: string;
    id?: string;
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    innerHTML?: string;
    textContent?: string;
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options) {
    if (options.className) {
      element.className = options.className;
    }
    if (options.id) {
      element.id = options.id;
    }
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    if (options.styles) {
      Object.assign(element.style, options.styles);
    }
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }
    if (options.textContent) {
      element.textContent = options.textContent;
    }
  }

  return element;
}

/**
 * Create an SVG element with attributes
 */
export function createSVGElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes?: Record<string, string>
): SVGElementTagNameMap[K] {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  return element;
}

/**
 * Wait for an element to appear in the DOM
 */
export function waitForElement<T extends Element = Element>(
  selector: string,
  options?: {
    timeout?: number;
    parent?: Element;
  }
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = options?.timeout || 5000;
    const parent = options?.parent || document.body;

    // Check if element already exists
    const existing = parent.querySelector<T>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    // Setup observer
    const observer = new MutationObserver(() => {
      const element = parent.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(parent, {
      childList: true,
      subtree: true,
    });

    // Setup timeout
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if an element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * Get the closest parent element matching a selector
 */
export function getClosestParent<T extends Element = Element>(
  element: Element,
  selector: string
): T | null {
  return element.closest<T>(selector);
}

/**
 * Remove an element safely
 */
export function removeElement(element: Element | null): void {
  if (element && element.parentNode) {
    try {
      element.parentNode.removeChild(element);
    } catch (error) {
      logger.warn('DOMUtils', 'Error removing element', error);
    }
  }
}

/**
 * Add CSS to the page
 */
export function injectCSS(css: string, id?: string): HTMLStyleElement {
  const style = createElement('style', {
    innerHTML: css,
    ...(id && { id }),
  });

  document.head.appendChild(style);
  return style;
}

/**
 * Load CSS file
 */
export function loadCSS(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = createElement('link', {
      attributes: {
        rel: 'stylesheet',
        href: url,
      },
    });

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));

    document.head.appendChild(link);
  });
}
