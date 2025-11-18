/**
 * Picture-in-Picture (PiP) Mode Feature
 * Enables picture-in-picture mode for videos
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';
import { Button } from '@ui/components/Button';
import { VideoControlsManager } from '@ui/controls/VideoControlsManager';

const PIP_ICON = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="white" stroke-width="2"/>
    <rect x="12" y="10" width="8" height="5" rx="1" fill="white"/>
  </svg>
`;

export class PiPModeFeature extends BaseFeature {
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
      // Skip if PiP not supported
      if (!document.pictureInPictureEnabled || video.disablePictureInPicture) {
        return;
      }

      // Create PiP button
      const button = new Button({
        icon: PIP_ICON,
        title: 'Picture-in-Picture',
        onClick: () => this.togglePiP(video),
      });

      // Store in state
      state.elements.set('button', button.getElement());

      // Register with controls manager
      this.controlsManager.registerControl(
        video,
        `${this.id}-button`,
        button.getElement(),
        this.priority
      );

      // Setup cleanup
      state.cleanup.push(() => {
        button.destroy();
        this.controlsManager.unregisterControl(video, `${this.id}-button`);
      });

      this.logger.debug('PiP button added to video');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'processVideo',
      });
    }
  }

  private async togglePiP(video: HTMLVideoElement): Promise<void> {
    try {
      if (document.pictureInPictureElement) {
        // Exit PiP
        await document.exitPictureInPicture();
        this.logger.debug('Exited PiP mode');
      } else {
        // Enter PiP
        await video.requestPictureInPicture();
        this.logger.debug('Entered PiP mode');
      }
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'togglePiP',
      });
    }
  }
}

// Factory function
export function createPiPModeFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'pipMode',
    name: 'Picture-in-Picture',
    description: 'Watch videos in a floating window',
    priority: 8,
    useVideoObserver: true,
  };

  return new PiPModeFeature(config, dependencies);
}
