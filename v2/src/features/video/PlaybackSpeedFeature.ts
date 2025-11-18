/**
 * Playback Speed Feature
 * Allows users to change video playback speed
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';
import { Dropdown, type DropdownOption } from '@ui/components/Dropdown';
import { VideoControlsManager } from '@ui/controls/VideoControlsManager';

const SPEED_OPTIONS: DropdownOption[] = [
  { value: '0.25', label: '0.25x' },
  { value: '0.5', label: '0.5x' },
  { value: '0.75', label: '0.75x' },
  { value: '1', label: '1x' },
  { value: '1.25', label: '1.25x' },
  { value: '1.5', label: '1.5x' },
  { value: '1.75', label: '1.75x' },
  { value: '2', label: '2x' },
  { value: '2.5', label: '2.5x' },
  { value: '3', label: '3x' },
];

export class PlaybackSpeedFeature extends BaseFeature {
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
      // Get current speed
      const currentSpeed = String(video.playbackRate || 1);

      // Create dropdown
      const dropdown = new Dropdown({
        options: SPEED_OPTIONS,
        value: currentSpeed,
        onChange: (value: string) => {
          this.setPlaybackSpeed(video, Number(value));
        },
      });

      // Store in state
      state.elements.set('dropdown', dropdown.getElement());

      // Register with controls manager
      this.controlsManager.registerControl(
        video,
        `${this.id}-dropdown`,
        dropdown.getElement(),
        this.priority
      );

      // Setup cleanup
      state.cleanup.push(() => {
        dropdown.destroy();
        this.controlsManager.unregisterControl(
          video,
          `${this.id}-dropdown`
        );
      });

      this.logger.debug('Playback speed control added to video');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'processVideo',
      });
    }
  }

  private setPlaybackSpeed(video: HTMLVideoElement, speed: number): void {
    try {
      video.playbackRate = speed;
      this.logger.debug(`Playback speed set to: ${speed}x`);
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'setPlaybackSpeed',
        metadata: { speed },
      });
    }
  }

}


// Factory function
export function createPlaybackSpeedFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'playbackSpeed',
    name: 'Playback Speed',
    description: 'Control video playback speed (0.25x - 3x)',
    priority: 9,
    useVideoObserver: true,
  };

  return new PlaybackSpeedFeature(config, dependencies);
}
