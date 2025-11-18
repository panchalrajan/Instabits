/**
 * Video Duration Feature
 * Displays current time and total duration overlay
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';
import { VideoControlsManager } from '@ui/controls/VideoControlsManager';

export class VideoDurationFeature extends BaseFeature {
  private controlsManager: VideoControlsManager;

  constructor(config: FeatureConfig, dependencies: any) {
    super(config, dependencies);
    this.controlsManager = new VideoControlsManager(this.logger);
  }

  protected onProcessVideo(
    video: HTMLVideoElement,
    state: VideoFeatureState
  ): void {
    try {
      // Create duration display element
      const timeDisplay = this.createDurationElement();

      // Update time immediately
      this.updateTimeDisplay(timeDisplay, video);

      // Store in state
      state.elements.set('timeDisplay', timeDisplay);

      // Register with controls manager
      this.controlsManager.registerControl(
        video,
        `${this.id}-display`,
        timeDisplay,
        this.priority
      );

      // Create update function
      const updateTime = () => this.updateTimeDisplay(timeDisplay, video);

      // Listen to time updates
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateTime);
      video.addEventListener('durationchange', updateTime);

      // Store listeners for cleanup
      state.listeners.set('timeupdate', updateTime);

      // Setup cleanup
      state.cleanup.push(() => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateTime);
        video.removeEventListener('durationchange', updateTime);
        this.controlsManager.unregisterControl(
          video,
          `${this.id}-display`
        );
      });

      this.logger.debug('Video duration display added to video');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'processVideo',
      });
    }
  }

  private createDurationElement(): HTMLDivElement {
    const element = document.createElement('div');
    element.className = 'instabits-duration';
    element.textContent = '0:00 / 0:00';

    // Styling
    Object.assign(element.style, {
      padding: '4px 8px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'monospace',
      userSelect: 'none',
      pointerEvents: 'none',
    });

    return element;
  }

  private updateTimeDisplay(
    element: HTMLDivElement,
    video: HTMLVideoElement
  ): void {
    const currentTime = this.formatTime(video.currentTime);
    const duration = this.formatTime(video.duration);
    element.textContent = `${currentTime} / ${duration}`;
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === Infinity) {
      return '0:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const paddedMins = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
    const paddedSecs = String(secs).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${paddedMins}:${paddedSecs}`;
    }
    return `${paddedMins}:${paddedSecs}`;
  }
}

// Factory function
export function createVideoDurationFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'videoDuration',
    name: 'Video Duration',
    description: 'Display current time and total duration',
    priority: 7,
    useVideoObserver: true,
  };

  return new VideoDurationFeature(config, dependencies);
}
