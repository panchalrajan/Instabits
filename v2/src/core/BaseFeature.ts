/**
 * Base Feature Class
 * Abstract base class for all features
 * Implements Template Method pattern and provides common functionality
 */

import type {
  IFeature,
  FeatureConfig,
  VideoFeatureState,
  FeatureDependencies,
} from '@app-types';
import type { ILogger, IStorage, IErrorHandler } from '@app-types';
import { getFeatureStorageKey } from '@app-types';

export abstract class BaseFeature implements IFeature {
  // Feature metadata
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priority: number;

  // Dependencies (injected)
  protected logger: ILogger;
  protected storage: IStorage;
  protected errorHandler: IErrorHandler;

  // State management
  private enabled = false;
  protected videoStates = new WeakMap<HTMLVideoElement, VideoFeatureState>();

  constructor(config: FeatureConfig, dependencies: FeatureDependencies) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.priority = config.priority ?? 5;

    this.logger = dependencies.logger;
    this.storage = dependencies.storage;
    this.errorHandler = dependencies.errorHandler;
  }

  /**
   * Initialize feature
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info(`Initializing feature: ${this.name}`);

      // Load enabled state from storage
      const storageKey = getFeatureStorageKey(this.id);
      const storedState = await this.storage.get<boolean>(storageKey);

      if (storedState !== null) {
        this.enabled = storedState;
      }

      // Call lifecycle hook
      await this.onInitialize();

      // Auto-enable if enabled
      if (this.enabled) {
        await this.enable();
      }

      this.logger.info(`Feature initialized: ${this.name}`);
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'initialize',
      });
    }
  }

  /**
   * Enable feature
   */
  async enable(): Promise<void> {
    try {
      if (this.enabled) {
        this.logger.warn(`Feature already enabled: ${this.name}`);
        return;
      }

      this.logger.info(`Enabling feature: ${this.name}`);

      // Update state
      this.enabled = true;

      // Save to storage
      const storageKey = getFeatureStorageKey(this.id);
      await this.storage.set(storageKey, true);

      // Call lifecycle hook
      await this.onEnable();

      this.logger.info(`Feature enabled: ${this.name}`);
    } catch (error) {
      this.enabled = false;
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'enable',
      });
    }
  }

  /**
   * Disable feature
   */
  async disable(): Promise<void> {
    try {
      if (!this.enabled) {
        this.logger.warn(`Feature already disabled: ${this.name}`);
        return;
      }

      this.logger.info(`Disabling feature: ${this.name}`);

      // Update state
      this.enabled = false;

      // Save to storage
      const storageKey = getFeatureStorageKey(this.id);
      await this.storage.set(storageKey, false);

      // Call lifecycle hook
      await this.onDisable();

      // Clean up all video states
      this.videoStates = new WeakMap();

      this.logger.info(`Feature disabled: ${this.name}`);
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'disable',
      });
    }
  }

  /**
   * Destroy feature (cleanup)
   */
  destroy(): void {
    try {
      this.logger.info(`Destroying feature: ${this.name}`);

      // Call lifecycle hook
      this.onDestroy();

      // Clean up
      this.enabled = false;
      this.videoStates = new WeakMap();

      this.logger.info(`Feature destroyed: ${this.name}`);
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'destroy',
      });
    }
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Process a video element
   */
  processVideo(video: HTMLVideoElement): void {
    try {
      // Skip if not enabled
      if (!this.enabled) {
        return;
      }

      // Skip if already processed
      if (this.videoStates.has(video)) {
        this.logger.debug(`Video already processed: ${this.id}`, video);
        return;
      }

      this.logger.debug(`Processing video: ${this.id}`, video);

      // Create video state
      const state: VideoFeatureState = {
        video,
        elements: new Map(),
        listeners: new Map(),
        cleanup: [],
      };

      this.videoStates.set(video, state);

      // Call implementation
      this.onProcessVideo(video, state);
    } catch (error) {
      this.errorHandler.handle(error as Error, {
        feature: this.id,
        action: 'processVideo',
      });
    }
  }

  /**
   * Get video state
   */
  protected getVideoState(
    video: HTMLVideoElement
  ): VideoFeatureState | undefined {
    return this.videoStates.get(video);
  }

  /**
   * Clean up video state
   */
  protected cleanupVideo(video: HTMLVideoElement): void {
    const state = this.videoStates.get(video);

    if (!state) {
      return;
    }

    this.logger.debug(`Cleaning up video: ${this.id}`, video);

    // Remove all elements
    state.elements.forEach((element) => {
      element.remove();
    });

    // Remove all listeners
    state.listeners.forEach((listener, event) => {
      video.removeEventListener(event, listener);
    });

    // Call cleanup functions
    state.cleanup.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        this.logger.error('Error in cleanup function', error as Error);
      }
    });

    // Remove from WeakMap
    this.videoStates.delete(video);
  }

  // Lifecycle hooks (override in subclasses)
  protected async onInitialize(): Promise<void> {
    // Override in subclass
  }

  protected async onEnable(): Promise<void> {
    // Override in subclass
  }

  protected async onDisable(): Promise<void> {
    // Override in subclass
  }

  protected onDestroy(): void {
    // Override in subclass
  }

  // Abstract method - must be implemented by subclasses
  protected abstract onProcessVideo(
    video: HTMLVideoElement,
    state: VideoFeatureState
  ): void;
}
