/**
 * Fullscreen Feature
 * Adds fullscreen button to videos
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';
import { Button } from '@ui/components/Button';
import { VideoControlsManager } from '@ui/controls/VideoControlsManager';

const FULLSCREEN_ICON = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
    <path d="M1 1v4h2V3h2V1H1zm12 0v2h2v2h2V1h-4zM3 11H1v4h4v-2H3v-2zm10 0v2h-2v2h4v-4h-2z"/>
  </svg>
`;

const EXIT_FULLSCREEN_ICON = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
    <path d="M3 1v2H1v2h4V1H3zm10 0v4h4V3h-2V1h-2zM1 11v2h2v2h2v-4H1zm12 0v4h2v-2h2v-2h-4z"/>
  </svg>
`;

export class FullscreenFeature extends BaseFeature {
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
      // Create fullscreen button
      const button = new Button({
        icon: FULLSCREEN_ICON,
        title: 'Toggle Fullscreen',
        onClick: () => this.toggleFullscreen(video),
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

      // Listen to fullscreen changes
      const handleFullscreenChange = () => {
        const isFullscreen = document.fullscreenElement === video;
        button.setIcon(
          isFullscreen ? EXIT_FULLSCREEN_ICON : FULLSCREEN_ICON
        );
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);

      // Setup cleanup
      state.cleanup.push(() => {
        button.destroy();
        this.controlsManager.unregisterControl(video, `${this.id}-button`);
        document.removeEventListener(
          'fullscreenchange',
          handleFullscreenChange
        );
      });

      this.logger.debug('Fullscreen button added to video');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'processVideo',
      });
    }
  }

  private async toggleFullscreen(
    video: HTMLVideoElement
  ): Promise<void> {
    try {
      if (document.fullscreenElement) {
        // Exit fullscreen
        await document.exitFullscreen();
        this.logger.debug('Exited fullscreen');
      } else {
        // Enter fullscreen
        await video.requestFullscreen();
        this.logger.debug('Entered fullscreen');
      }
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'toggleFullscreen',
      });
    }
  }

}

// Factory function
export function createFullscreenFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'fullscreen',
    name: 'Fullscreen',
    description: 'Quick fullscreen button for videos',
    priority: 10,
    useVideoObserver: true,
  };

  return new FullscreenFeature(config, dependencies);
}
