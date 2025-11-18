/**
 * Video Observer - Detects and notifies about video elements
 * Uses MutationObserver for efficient video detection
 */

import { logger } from '@services/Logger';
import { debounce } from '@utils/dom.utils';
import { SELECTORS, DELAYS } from '@utils/constants';
import type { VideoCallback } from '@/types/features';

export class VideoObserver {
  private static instance: VideoObserver;
  private observer: MutationObserver | null = null;
  private callbacks: Set<VideoCallback> = new Set();
  private processedVideos: WeakSet<HTMLVideoElement> = new WeakSet();

  private constructor() {
    this.handleMutations = debounce(this.handleMutations.bind(this), DELAYS.VIDEO_DETECTION);
  }

  public static getInstance(): VideoObserver {
    if (!VideoObserver.instance) {
      VideoObserver.instance = new VideoObserver();
    }
    return VideoObserver.instance;
  }

  /**
   * Start observing for video elements
   */
  public start(): void {
    if (this.observer) {
      logger.warn('VideoObserver', 'Observer already started');
      return;
    }

    logger.info('VideoObserver', 'Starting video detection');

    // Process existing videos
    this.processExistingVideos();

    // Setup mutation observer
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Stop observing
   */
  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      logger.info('VideoObserver', 'Stopped video detection');
    }
  }

  /**
   * Subscribe to video notifications
   */
  public subscribe(callback: VideoCallback): void {
    this.callbacks.add(callback);
    logger.debug('VideoObserver', `Added callback. Total: ${this.callbacks.size}`);
  }

  /**
   * Unsubscribe from video notifications
   */
  public unsubscribe(callback: VideoCallback): void {
    this.callbacks.delete(callback);
    logger.debug('VideoObserver', `Removed callback. Total: ${this.callbacks.size}`);
  }

  /**
   * Process existing videos in the DOM
   */
  private processExistingVideos(): void {
    const videos = document.querySelectorAll<HTMLVideoElement>(SELECTORS.VIDEO);

    logger.debug('VideoObserver', `Found ${videos.length} existing videos`);

    videos.forEach((video) => {
      if (this.isValidVideo(video) && !this.processedVideos.has(video)) {
        this.notifyCallbacks(video);
        this.processedVideos.add(video);
      }
    });
  }

  /**
   * Handle DOM mutations
   */
  private handleMutations(mutations: MutationRecord[]): void {
    const newVideos: HTMLVideoElement[] = [];

    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          // Check if the node itself is a video
          if (element.tagName === 'VIDEO') {
            const video = element as HTMLVideoElement;
            if (this.isValidVideo(video) && !this.processedVideos.has(video)) {
              newVideos.push(video);
              this.processedVideos.add(video);
            }
          }

          // Check for videos in children
          const childVideos = element.querySelectorAll<HTMLVideoElement>(SELECTORS.VIDEO);
          childVideos.forEach((video) => {
            if (this.isValidVideo(video) && !this.processedVideos.has(video)) {
              newVideos.push(video);
              this.processedVideos.add(video);
            }
          });
        }
      }
    }

    if (newVideos.length > 0) {
      logger.debug('VideoObserver', `Detected ${newVideos.length} new videos`);
      newVideos.forEach((video) => this.notifyCallbacks(video));
    }
  }

  /**
   * Check if video is valid (has playsinline attribute, typical for Instagram)
   */
  private isValidVideo(video: HTMLVideoElement): boolean {
    return (
      video.hasAttribute('playsinline') &&
      video.src !== '' &&
      !video.closest('[data-instabits-processed]')
    );
  }

  /**
   * Notify all callbacks about a video
   */
  private notifyCallbacks(video: HTMLVideoElement): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(video);
      } catch (error) {
        logger.error('VideoObserver', 'Error in video callback', error);
      }
    });
  }

  /**
   * Clear processed videos (useful for testing)
   */
  public clearProcessed(): void {
    this.processedVideos = new WeakSet();
    logger.debug('VideoObserver', 'Cleared processed videos');
  }
}

// Export singleton instance
export const videoObserver = VideoObserver.getInstance();
