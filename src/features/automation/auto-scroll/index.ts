import { BaseFeature } from '@core/feature-system/BaseFeature';
import { FEATURE_IDS } from '@utils/constants';

export default class AutoScrollFeature extends BaseFeature {
  public readonly id = FEATURE_IDS.AUTO_SCROLL;
  public readonly name = 'Auto Scroll';

  public async initialize(): Promise<void> {
    this.log('Initialized');
  }

  public processVideo(video: HTMLVideoElement): void {
    if (this.isTracked(video)) return;
    // TODO: Implement auto-scroll for reels
    this.markAsTracked(video);
    this.debug('Processed video');
  }

  public onCleanup(): void {
    this.log('Cleaned up');
  }
}
