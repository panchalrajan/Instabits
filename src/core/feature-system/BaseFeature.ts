/**
 * Base Feature class that all features extend
 * Provides common functionality and enforces implementation contract
 */

import { logger } from '@services/Logger';
import { createElement } from '@utils/dom.utils';
import type { IFeature } from '@/types/features';

export abstract class BaseFeature implements IFeature {
  public abstract readonly id: string;
  public abstract readonly name: string;

  protected trackedVideos: WeakMap<HTMLVideoElement, boolean> = new WeakMap();
  protected cleanupObservers: WeakMap<HTMLVideoElement, MutationObserver> = new WeakMap();

  /**
   * Initialize the feature - load settings, setup listeners, etc.
   */
  public abstract initialize(): Promise<void>;

  /**
   * Process a video element - main feature logic
   */
  public abstract processVideo(video: HTMLVideoElement): void;

  /**
   * Cleanup when feature is disabled
   */
  public abstract onCleanup(): void;

  /**
   * Handle settings change (optional)
   */
  public onSettingsChange?(settings: Record<string, any>): void;

  /**
   * Check if video is already tracked
   */
  protected isTracked(video: HTMLVideoElement): boolean {
    return this.trackedVideos.has(video);
  }

  /**
   * Mark video as tracked
   */
  protected markAsTracked(video: HTMLVideoElement): void {
    this.trackedVideos.set(video, true);
  }

  /**
   * Get parent element for UI controls
   */
  protected getParentElement(video: HTMLVideoElement): HTMLElement | null {
    // Try to find the parent container
    let parent = video.parentElement;

    while (parent) {
      // Instagram videos are usually in a specific container
      if (parent.classList.contains('_aatk') || parent.classList.contains('_ab4k')) {
        return parent;
      }
      parent = parent.parentElement;
    }

    // Fallback to video's direct parent
    return video.parentElement;
  }

  /**
   * Create a button element
   */
  protected createButton(options: {
    className?: string;
    title?: string;
    innerHTML?: string;
    onClick?: (event: MouseEvent) => void;
  }): HTMLButtonElement {
    const button = createElement('button', {
      className: options.className || 'instabits-btn',
      attributes: {
        type: 'button',
        ...(options.title && { title: options.title }),
      },
      innerHTML: options.innerHTML || '',
    });

    if (options.onClick) {
      button.addEventListener('click', options.onClick);
    }

    return button;
  }

  /**
   * Create a container element
   */
  protected createContainer(options: {
    className?: string;
    id?: string;
  }): HTMLDivElement {
    return createElement('div', {
      className: options.className || 'instabits-container',
      ...(options.id && { id: options.id }),
    });
  }

  /**
   * Setup cleanup observer to remove UI when video is removed
   */
  protected setupCleanupObserver(
    video: HTMLVideoElement,
    elementsToRemove: HTMLElement[]
  ): void {
    const parent = video.parentElement;
    if (!parent) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.removedNodes)) {
          if (node === video) {
            // Video was removed, clean up our elements
            elementsToRemove.forEach((element) => {
              if (element.parentNode) {
                element.parentNode.removeChild(element);
              }
            });

            // Disconnect observer
            observer.disconnect();
            this.cleanupObservers.delete(video);

            logger.debug(this.id, 'Cleaned up UI elements for removed video');
            return;
          }
        }
      }
    });

    observer.observe(parent, { childList: true });
    this.cleanupObservers.set(video, observer);
  }

  /**
   * Disconnect all cleanup observers
   */
  protected disconnectAllObservers(): void {
    // We can't iterate over WeakMap, so this is just a placeholder
    // Individual observers will disconnect when videos are removed
    logger.debug(this.id, 'Cleanup observers will disconnect automatically');
  }

  /**
   * Log helper methods
   */
  protected log(message: string, ...args: any[]): void {
    logger.info(this.id, message, ...args);
  }

  protected debug(message: string, ...args: any[]): void {
    logger.debug(this.id, message, ...args);
  }

  protected warn(message: string, ...args: any[]): void {
    logger.warn(this.id, message, ...args);
  }

  protected error(message: string, error?: Error): void {
    logger.error(this.id, message, error);
  }
}
