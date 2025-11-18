/**
 * Video Seekbar Feature
 * Interactive progress bar with scrubbing
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';
import { VideoControlsManager } from '@ui/controls/VideoControlsManager';

export class SeekbarFeature extends BaseFeature {
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
      // Create seekbar container
      const container = this.createSeekbarContainer();
      const progressBar = container.querySelector('.progress-bar') as HTMLDivElement;
      const progress = container.querySelector('.progress') as HTMLDivElement;

      // Update progress
      const updateProgress = () => {
        const percent = (video.currentTime / video.duration) * 100 || 0;
        progress.style.width = `${percent}%`;
      };

      // Handle seeking
      const handleSeek = (e: MouseEvent) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        video.currentTime = (percent / 100) * video.duration;
      };

      // Event listeners
      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('loadedmetadata', updateProgress);
      progressBar.addEventListener('click', handleSeek);

      // Store in state
      state.elements.set('seekbar', container);
      state.listeners.set('timeupdate', updateProgress);

      // Register with controls manager
      this.controlsManager.registerControl(
        video,
        `${this.id}-seekbar`,
        container,
        this.priority
      );

      // Setup cleanup
      state.cleanup.push(() => {
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('loadedmetadata', updateProgress);
        progressBar.removeEventListener('click', handleSeek);
        this.controlsManager.unregisterControl(video, `${this.id}-seekbar`);
      });

      this.logger.debug('Seekbar added to video');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'processVideo',
      });
    }
  }

  private createSeekbarContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'instabits-seekbar';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progress = document.createElement('div');
    progress.className = 'progress';

    progressBar.appendChild(progress);
    container.appendChild(progressBar);

    // Styling
    Object.assign(container.style, {
      width: '120px',
      padding: '6px 10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '4px',
    });

    Object.assign(progressBar.style, {
      width: '100%',
      height: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '2px',
      cursor: 'pointer',
      position: 'relative',
    });

    Object.assign(progress.style, {
      width: '0%',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: '2px',
      transition: 'width 0.1s',
    });

    return container;
  }
}

// Factory function
export function createSeekbarFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'videoSeekbar',
    name: 'Video Seekbar',
    description: 'Interactive progress bar for seeking',
    priority: 6,
    useVideoObserver: true,
  };

  return new SeekbarFeature(config, dependencies);
}
