/**
 * Video Controls Manager
 * Manages UI control elements for video features
 * Single Responsibility: Layout and positioning of controls
 */

import type { ILogger } from '@app-types';
import { UI_CONFIG } from '@app-types';

interface ControlElement {
  element: HTMLElement;
  order: number;
}

export class VideoControlsManager {
  private static containers = new WeakMap<
    HTMLVideoElement,
    HTMLDivElement
  >();
  private static controls = new WeakMap<
    HTMLVideoElement,
    Map<string, ControlElement>
  >();
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Get or create controls container for video
   */
  getContainer(video: HTMLVideoElement): HTMLDivElement {
    let container = VideoControlsManager.containers.get(video);

    if (!container) {
      container = this.createContainer(video);
      VideoControlsManager.containers.set(video, container);
      VideoControlsManager.controls.set(video, new Map());
    }

    return container;
  }

  /**
   * Register a control element
   */
  registerControl(
    video: HTMLVideoElement,
    id: string,
    element: HTMLElement,
    order: number
  ): void {
    const container = this.getContainer(video);
    const controls = VideoControlsManager.controls.get(video);

    if (!controls) {
      this.logger.error('Controls map not found for video');
      return;
    }

    // Remove existing control if present
    if (controls.has(id)) {
      this.unregisterControl(video, id);
    }

    // Add to controls map
    controls.set(id, { element, order });

    // Add to container
    this.updateLayout(container, controls);

    this.logger.debug(`Registered control: ${id}`, { order });
  }

  /**
   * Unregister a control element
   */
  unregisterControl(video: HTMLVideoElement, id: string): void {
    const controls = VideoControlsManager.controls.get(video);

    if (!controls || !controls.has(id)) {
      return;
    }

    const control = controls.get(id)!;
    control.element.remove();
    controls.delete(id);

    this.logger.debug(`Unregistered control: ${id}`);
  }

  /**
   * Remove all controls for video
   */
  removeAllControls(video: HTMLVideoElement): void {
    const container = VideoControlsManager.containers.get(video);

    if (container) {
      container.remove();
      VideoControlsManager.containers.delete(video);
    }

    VideoControlsManager.controls.delete(video);
  }

  /**
   * Create controls container
   */
  private createContainer(video: HTMLVideoElement): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'instabits-video-controls';

    // Apply styles
    Object.assign(container.style, {
      position: 'absolute',
      top: this.getPositionStyle().top,
      left: this.getPositionStyle().left,
      right: this.getPositionStyle().right,
      bottom: this.getPositionStyle().bottom,
      display: 'flex',
      flexDirection: 'row',
      gap: `${UI_CONFIG.controlsGap}px`,
      zIndex: String(UI_CONFIG.zIndex),
      pointerEvents: 'none', // Allow clicks through container
    });

    // Ensure parent is positioned
    const parent = video.parentElement;
    if (parent) {
      const position = window.getComputedStyle(parent).position;
      if (position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(container);
    }

    return container;
  }

  /**
   * Update layout based on controls order
   */
  private updateLayout(
    container: HTMLDivElement,
    controls: Map<string, ControlElement>
  ): void {
    // Sort by order
    const sorted = Array.from(controls.values()).sort(
      (a, b) => b.order - a.order
    );

    // Clear container
    container.innerHTML = '';

    // Add elements in order
    sorted.forEach(({ element }) => {
      // Enable pointer events on individual controls
      element.style.pointerEvents = 'auto';
      container.appendChild(element);
    });
  }

  /**
   * Get position styles based on config
   */
  private getPositionStyle(): {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  } {
    const offset = '12px';

    switch (UI_CONFIG.controlsPosition) {
      case 'top-left':
        return { top: offset, left: offset };
      case 'top-right':
        return { top: offset, right: offset };
      case 'bottom-left':
        return { bottom: offset, left: offset };
      case 'bottom-right':
        return { bottom: offset, right: offset };
      default:
        return { top: offset, left: offset };
    }
  }
}
