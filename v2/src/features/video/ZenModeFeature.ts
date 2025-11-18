/**
 * Zen Mode Feature
 * Hide UI overlays for distraction-free viewing
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';

export class ZenModeFeature extends BaseFeature {
  constructor(config: FeatureConfig, dependencies: any) {
    super(config, dependencies);
  }

  protected async onEnable(): Promise<void> {
    // Add global style to hide Instagram UI elements
    const style = document.createElement('style');
    style.id = 'instabits-zen-mode';
    style.textContent = `
      /* Hide Instagram UI overlays on videos */
      article video + div,
      article video ~ div[class*="Overlay"],
      article video ~ div[style*="position: absolute"] {
        opacity: 0 !important;
        transition: opacity 0.3s !important;
      }

      /* Show on hover */
      article:hover video + div,
      article:hover video ~ div[class*="Overlay"],
      article:hover video ~ div[style*="position: absolute"] {
        opacity: 1 !important;
      }

      /* Keep InstaBits controls visible */
      .instabits-video-controls,
      .instabits-btn,
      .instabits-dropdown,
      .instabits-slider,
      .instabits-seekbar,
      .instabits-duration {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    this.logger.info('Zen mode enabled');
  }

  protected async onDisable(): Promise<void> {
    // Remove zen mode style
    const style = document.getElementById('instabits-zen-mode');
    if (style) {
      style.remove();
    }
    this.logger.info('Zen mode disabled');
  }

  protected onProcessVideo(
    _video: HTMLVideoElement,
    _state: VideoFeatureState
  ): void {
    // Zen mode works globally, no per-video processing needed
  }
}

// Factory function
export function createZenModeFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'zenMode',
    name: 'Zen Mode',
    description: 'Hide UI overlays for distraction-free viewing',
    priority: 4,
    useVideoObserver: false,
  };

  return new ZenModeFeature(config, dependencies);
}
