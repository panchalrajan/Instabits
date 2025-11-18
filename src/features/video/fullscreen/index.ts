import { BaseFeature } from '@core/feature-system/BaseFeature';
import { FEATURE_IDS } from '@utils/constants';

export default class FullscreenFeature extends BaseFeature {
  public readonly id = FEATURE_IDS.FULLSCREEN;
  public readonly name = 'Fullscreen';

  public async initialize(): Promise<void> {
    this.log('Initialized');
  }

  public processVideo(video: HTMLVideoElement): void {
    if (this.isTracked(video)) return;
    // TODO: Implement fullscreen button
    this.markAsTracked(video);
    this.debug('Processed video');
  }

  public onCleanup(): void {
    this.log('Cleaned up');
  }
}
