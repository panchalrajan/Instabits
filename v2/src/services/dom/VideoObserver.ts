/**
 * Video Observer Service
 * Efficiently detects video elements using MutationObserver
 * Implements Observer pattern and Single Responsibility Principle
 */

import type { IVideoObserver, VideoCallback } from '@app-types';
import type { ILogger } from '@app-types';
import { debounce } from '@utils/debounce';
import { VIDEO_CONFIG } from '@app-types';

export class VideoObserver implements IVideoObserver {
  private static instance: VideoObserver;
  private logger: ILogger;
  private observer: MutationObserver | null = null;
  private seenVideos = new WeakSet<HTMLVideoElement>();
  private detectedCallbacks: VideoCallback[] = [];
  private removedCallbacks: VideoCallback[] = [];
  private isObserving = false;

  private constructor(logger: ILogger) {
    this.logger = logger;
  }

  static getInstance(logger: ILogger): VideoObserver {
    if (!VideoObserver.instance) {
      VideoObserver.instance = new VideoObserver(logger);
    }
    return VideoObserver.instance;
  }

  /**
   * Start observing for video elements
   */
  start(): void {
    if (this.isObserving) {
      this.logger.warn('VideoObserver already started');
      return;
    }

    this.logger.info('Starting VideoObserver');

    // Process existing videos
    this.processExistingVideos();

    // Create mutation observer
    this.observer = new MutationObserver(
      debounce(
        this.handleMutations.bind(this),
        VIDEO_CONFIG.observerDebounce
      ) as MutationCallback
    );

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.isObserving = true;
  }

  /**
   * Stop observing
   */
  stop(): void {
    if (!this.isObserving) {
      return;
    }

    this.logger.info('Stopping VideoObserver');

    this.observer?.disconnect();
    this.observer = null;
    this.isObserving = false;
  }

  /**
   * Subscribe to video detected events
   */
  onVideoDetected(callback: VideoCallback): () => void {
    this.detectedCallbacks.push(callback);
    this.logger.debug('Subscribed to video detected events');

    // Return unsubscribe function
    return () => {
      const index = this.detectedCallbacks.indexOf(callback);
      if (index !== -1) {
        this.detectedCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to video removed events
   */
  onVideoRemoved(callback: VideoCallback): () => void {
    this.removedCallbacks.push(callback);
    this.logger.debug('Subscribed to video removed events');

    // Return unsubscribe function
    return () => {
      const index = this.removedCallbacks.indexOf(callback);
      if (index !== -1) {
        this.removedCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Process existing videos in the DOM
   */
  private processExistingVideos(): void {
    const videos = document.querySelectorAll('video');
    this.logger.debug(`Found ${videos.length} existing videos`);

    videos.forEach((video) => {
      if (video instanceof HTMLVideoElement) {
        this.processVideo(video);
      }
    });
  }

  /**
   * Handle DOM mutations
   */
  private handleMutations(mutations: MutationRecord[]): void {
    const addedVideos = new Set<HTMLVideoElement>();
    const removedVideos = new Set<HTMLVideoElement>();

    mutations.forEach((mutation) => {
      // Check added nodes
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLVideoElement) {
          addedVideos.add(node);
        } else if (node instanceof Element) {
          const videos = node.querySelectorAll('video');
          videos.forEach((video) => {
            if (video instanceof HTMLVideoElement) {
              addedVideos.add(video);
            }
          });
        }
      });

      // Check removed nodes
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLVideoElement) {
          removedVideos.add(node);
        } else if (node instanceof Element) {
          const videos = node.querySelectorAll('video');
          videos.forEach((video) => {
            if (video instanceof HTMLVideoElement) {
              removedVideos.add(video);
            }
          });
        }
      });
    });

    // Process added videos
    addedVideos.forEach((video) => {
      this.processVideo(video);
    });

    // Process removed videos
    removedVideos.forEach((video) => {
      this.notifyVideoRemoved(video);
    });
  }

  /**
   * Process a single video
   */
  private processVideo(video: HTMLVideoElement): void {
    // Skip if already seen
    if (this.seenVideos.has(video)) {
      return;
    }

    this.seenVideos.add(video);
    this.logger.debug('New video detected', video);

    // Notify subscribers
    this.notifyVideoDetected(video);
  }

  /**
   * Notify video detected subscribers
   */
  private notifyVideoDetected(video: HTMLVideoElement): void {
    this.detectedCallbacks.forEach((callback) => {
      try {
        callback(video);
      } catch (error) {
        this.logger.error(
          'Error in video detected callback',
          error as Error
        );
      }
    });
  }

  /**
   * Notify video removed subscribers
   */
  private notifyVideoRemoved(video: HTMLVideoElement): void {
    this.removedCallbacks.forEach((callback) => {
      try {
        callback(video);
      } catch (error) {
        this.logger.error(
          'Error in video removed callback',
          error as Error
        );
      }
    });
  }

  /**
   * Check if video has been seen
   */
  isVideoSeen(video: HTMLVideoElement): boolean {
    return this.seenVideos.has(video);
  }
}
