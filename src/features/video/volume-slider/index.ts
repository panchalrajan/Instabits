import { BaseFeature } from '@core/feature-system/BaseFeature';
import { FEATURE_IDS } from '@utils/constants';

export default class VolumeSliderFeature extends BaseFeature {
  public readonly id = FEATURE_IDS.VOLUME_SLIDER;
  public readonly name = 'Volume Slider';

  public async initialize(): Promise<void> {
    this.log('Initialized');
  }

  public processVideo(video: HTMLVideoElement): void {
    if (this.isTracked(video)) return;
    // TODO: Implement volume slider UI
    this.markAsTracked(video);
    this.debug('Processed video');
  }

  public onCleanup(): void {
    this.log('Cleaned up');
  }
}
