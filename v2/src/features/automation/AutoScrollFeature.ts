/**
 * Auto Scroll Feature
 * Automatically scroll to next reel when current ends
 */

import { BaseFeature } from '@core/BaseFeature';
import type { FeatureConfig, VideoFeatureState } from '@app-types';

export class AutoScrollFeature extends BaseFeature {
  private isReelsFeed = false;

  constructor(config: FeatureConfig, dependencies: any) {
    super(config, dependencies);
  }

  protected async onInitialize(): Promise<void> {
    // Check if we're on reels feed
    this.checkReelsFeed();

    // Monitor URL changes
    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        this.checkReelsFeed();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  private checkReelsFeed(): void {
    this.isReelsFeed = window.location.pathname.includes('/reels');
    this.logger.debug(`Reels feed: ${this.isReelsFeed}`);
  }

  protected onProcessVideo(
    video: HTMLVideoElement,
    state: VideoFeatureState
  ): void {
    if (!this.isReelsFeed) {
      return;
    }

    try {
      const handleEnded = () => {
        this.scrollToNextReel(video);
      };

      video.addEventListener('ended', handleEnded);
      state.listeners.set('ended', handleEnded);

      state.cleanup.push(() => {
        video.removeEventListener('ended', handleEnded);
      });

      this.logger.debug('Auto scroll enabled for video');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'processVideo',
      });
    }
  }

  private scrollToNextReel(currentVideo: HTMLVideoElement): void {
    try {
      // Find the article containing the current video
      const article = currentVideo.closest('article');
      if (!article) {
        return;
      }

      // Find the next article (next reel)
      const nextArticle = article.nextElementSibling as HTMLElement;
      if (!nextArticle) {
        return;
      }

      // Scroll to next reel smoothly
      nextArticle.scrollIntoView({ behavior: 'smooth', block: 'center' });

      this.logger.debug('Scrolled to next reel');
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'scrollToNextReel',
      });
    }
  }
}

// Factory function
export function createAutoScrollFeature(dependencies: any) {
  const config: FeatureConfig = {
    id: 'autoScroll',
    name: 'Auto Scroll',
    description: 'Automatically scroll to next reel when current ends',
    priority: 2,
    useVideoObserver: true,
  };

  return new AutoScrollFeature(config, dependencies);
}
