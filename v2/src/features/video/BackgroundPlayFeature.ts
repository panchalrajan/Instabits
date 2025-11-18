/**
 * Background Play Feature
 * Continue playback when tab is hidden or minimized
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';

export class BackgroundPlayFeature extends BaseFeature {
  private originalHidden: any;
  private originalVisibilityState: any;

  constructor(config: FeatureConfig, dependencies: any) {
    super(config, dependencies);
  }

  protected async onEnable(): Promise<void> {
    // Override document visibility properties to trick Instagram
    // into thinking the tab is always visible
    try {
      this.originalHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
      this.originalVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');

      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false,
      });

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });

      this.logger.info('Background play enabled');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'enable',
      });
    }
  }

  protected async onDisable(): Promise<void> {
    // Restore original visibility properties
    try {
      if (this.originalHidden) {
        Object.defineProperty(document, 'hidden', this.originalHidden);
      }

      if (this.originalVisibilityState) {
        Object.defineProperty(document, 'visibilityState', this.originalVisibilityState);
      }

      this.logger.info('Background play disabled');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'disable',
      });
    }
  }

  protected onProcessVideo(
    video: HTMLVideoElement,
    state: VideoFeatureState
  ): void {
    // Background play works globally, no per-video processing needed
  }
}

// Factory function
export function createBackgroundPlayFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'backgroundPlay',
    name: 'Background Play',
    description: 'Continue playback when tab is hidden',
    priority: 3,
    useVideoObserver: false,
  };

  return new BackgroundPlayFeature(config, dependencies);
}
