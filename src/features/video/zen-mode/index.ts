import { BaseFeature } from '@core/feature-system/BaseFeature';
import { FEATURE_IDS } from '@utils/constants';

export default class ZenModeFeature extends BaseFeature {
  public readonly id = FEATURE_IDS.ZEN_MODE;
  public readonly name = 'Zen Mode';

  public async initialize(): Promise<void> {
    this.log('Initialized');
  }

  public processVideo(video: HTMLVideoElement): void {
    if (this.isTracked(video)) return;
    // TODO: Implement zen mode (hide overlays)
    this.markAsTracked(video);
    this.debug('Processed video');
  }

  public onCleanup(): void {
    this.log('Cleaned up');
  }
}
