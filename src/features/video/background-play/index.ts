import { BaseFeature } from '@core/feature-system/BaseFeature';
import { FEATURE_IDS } from '@utils/constants';

export default class BackgroundPlayFeature extends BaseFeature {
  public readonly id = FEATURE_IDS.BACKGROUND_PLAY;
  public readonly name = 'Background Play';

  public async initialize(): Promise<void> {
    this.log('Initialized');
  }

  public processVideo(video: HTMLVideoElement): void {
    if (this.isTracked(video)) return;
    // TODO: Implement background play logic
    this.markAsTracked(video);
    this.debug('Processed video');
  }

  public onCleanup(): void {
    this.log('Cleaned up');
  }
}
