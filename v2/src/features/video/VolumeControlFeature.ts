/**
 * Volume Control Feature
 * Allows users to control video volume with a slider
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';
import { Slider } from '@ui/components/Slider';
import { VideoControlsManager } from '@ui/controls/VideoControlsManager';

export class VolumeControlFeature extends BaseFeature {
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
      // Get current volume (0-100)
      const currentVolume = Math.round((video.volume || 0.5) * 100);

      // Create slider
      const slider = new Slider({
        min: 0,
        max: 100,
        value: currentVolume,
        step: 1,
        onChange: (value: number) => {
          this.setVolume(video, value);
        },
      });

      // Store in state
      state.elements.set('slider', slider.getElement());

      // Register with controls manager
      this.controlsManager.registerControl(
        video,
        `${this.id}-slider`,
        slider.getElement(),
        this.priority
      );

      // Listen to volume changes from other sources
      const handleVolumeChange = () => {
        const newVolume = Math.round(video.volume * 100);
        slider.setValue(newVolume, true);
      };

      video.addEventListener('volumechange', handleVolumeChange);
      state.listeners.set('volumechange', handleVolumeChange);

      // Setup cleanup
      state.cleanup.push(() => {
        slider.destroy();
        this.controlsManager.unregisterControl(video, `${this.id}-slider`);
        video.removeEventListener('volumechange', handleVolumeChange);
      });

      this.logger.debug('Volume control added to video');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'processVideo',
      });
    }
  }

  private setVolume(video: HTMLVideoElement, volume: number): void {
    try {
      // Convert 0-100 to 0-1
      video.volume = volume / 100;

      // Unmute if volume > 0
      if (volume > 0 && video.muted) {
        video.muted = false;
      }

      this.logger.debug(`Volume set to: ${volume}%`);
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'setVolume',
        metadata: { volume },
      });
    }
  }

}

// Factory function
export function createVolumeControlFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'volumeControl',
    name: 'Volume Control',
    description: 'Control video volume with a slider',
    priority: 8,
    useVideoObserver: true,
  };

  return new VolumeControlFeature(config, dependencies);
}
