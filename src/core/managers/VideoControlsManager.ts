/**
 * Video Controls Manager - Manages UI element positioning
 * Provides centralized layout system for feature UI elements
 */

import { logger } from '@services/Logger';
import { createElement } from '@utils/dom.utils';
import type { ControlConfig, ControlPosition } from '@/types/features';

export class VideoControlsManager {
  private static instance: VideoControlsManager;
  private controlsByVideo: WeakMap<
    HTMLVideoElement,
    Map<string, ControlConfig>
  > = new WeakMap();
  private containersByVideo: WeakMap<HTMLVideoElement, HTMLElement> = new WeakMap();

  private constructor() {}

  public static getInstance(): VideoControlsManager {
    if (!VideoControlsManager.instance) {
      VideoControlsManager.instance = new VideoControlsManager();
    }
    return VideoControlsManager.instance;
  }

  /**
   * Register a control element for a video
   */
  public register(
    video: HTMLVideoElement,
    featureId: string,
    element: HTMLElement,
    position: ControlPosition = 'right',
    order: number = 0
  ): void {
    // Get or create controls map for this video
    let controls = this.controlsByVideo.get(video);
    if (!controls) {
      controls = new Map();
      this.controlsByVideo.set(video, controls);
    }

    // Add control
    controls.set(featureId, { element, position, order, featureId });

    logger.debug('VideoControlsManager', `Registered control: ${featureId} at ${position}`);

    // Update layout
    this.updateLayout(video);
  }

  /**
   * Unregister a control
   */
  public unregister(video: HTMLVideoElement, featureId: string): void {
    const controls = this.controlsByVideo.get(video);
    if (controls) {
      controls.delete(featureId);
      logger.debug('VideoControlsManager', `Unregistered control: ${featureId}`);

      // Update layout
      this.updateLayout(video);
    }
  }

  /**
   * Get or create the controls container for a video
   */
  public getContainer(video: HTMLVideoElement): HTMLElement {
    let container = this.containersByVideo.get(video);

    if (!container) {
      container = this.createContainer(video);
      this.containersByVideo.set(video, container);
    }

    return container;
  }

  /**
   * Create controls container
   */
  private createContainer(video: HTMLVideoElement): HTMLElement {
    const parent = this.getParentElement(video);
    if (!parent) {
      throw new Error('Could not find parent element for video');
    }

    const container = createElement('div', {
      className: 'instabits-controls-container',
      styles: {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        zIndex: '10',
      },
    });

    // Create position groups
    const leftGroup = createElement('div', {
      className: 'instabits-controls-left',
      styles: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        pointerEvents: 'auto',
      },
    });

    const centerGroup = createElement('div', {
      className: 'instabits-controls-center',
      styles: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flex: '1',
        justifyContent: 'center',
        pointerEvents: 'auto',
      },
    });

    const rightGroup = createElement('div', {
      className: 'instabits-controls-right',
      styles: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        pointerEvents: 'auto',
      },
    });

    container.appendChild(leftGroup);
    container.appendChild(centerGroup);
    container.appendChild(rightGroup);

    parent.appendChild(container);

    logger.debug('VideoControlsManager', 'Created controls container');

    return container;
  }

  /**
   * Update layout - reposition all controls
   */
  private updateLayout(video: HTMLVideoElement): void {
    const controls = this.controlsByVideo.get(video);
    if (!controls || controls.size === 0) return;

    const container = this.getContainer(video);
    const leftGroup = container.querySelector('.instabits-controls-left') as HTMLElement;
    const centerGroup = container.querySelector('.instabits-controls-center') as HTMLElement;
    const rightGroup = container.querySelector('.instabits-controls-right') as HTMLElement;

    // Clear existing controls
    leftGroup.innerHTML = '';
    centerGroup.innerHTML = '';
    rightGroup.innerHTML = '';

    // Sort controls by order
    const sortedControls = Array.from(controls.values()).sort((a, b) => a.order - b.order);

    // Append to appropriate groups
    sortedControls.forEach((control) => {
      switch (control.position) {
        case 'left':
          leftGroup.appendChild(control.element);
          break;
        case 'center':
          centerGroup.appendChild(control.element);
          break;
        case 'right':
          rightGroup.appendChild(control.element);
          break;
      }
    });

    logger.debug('VideoControlsManager', `Updated layout with ${sortedControls.length} controls`);
  }

  /**
   * Get parent element for positioning
   */
  private getParentElement(video: HTMLVideoElement): HTMLElement | null {
    let parent = video.parentElement;

    while (parent) {
      const position = window.getComputedStyle(parent).position;
      if (position === 'relative' || position === 'absolute') {
        return parent;
      }
      parent = parent.parentElement;
    }

    // Fallback to video's parent
    return video.parentElement;
  }

  /**
   * Clear all controls for a video
   */
  public clear(video: HTMLVideoElement): void {
    const container = this.containersByVideo.get(video);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }

    this.controlsByVideo.delete(video);
    this.containersByVideo.delete(video);

    logger.debug('VideoControlsManager', 'Cleared all controls for video');
  }
}

// Export singleton instance
export const videoControlsManager = VideoControlsManager.getInstance();
