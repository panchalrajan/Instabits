/**
 * Feature Manager
 * Manages feature lifecycle and registration
 * Implements Singleton and Factory patterns
 */

import type {
  IFeatureManager,
  IFeature,
  FeatureConfig,
  FeatureFactory,
  FeatureDependencies,
} from '@app-types';
import type { ILogger, IStorage, IErrorHandler, IVideoObserver } from '@app-types';

interface RegisteredFeature {
  config: FeatureConfig;
  factory: FeatureFactory;
  instance?: IFeature;
}

export class FeatureManager implements IFeatureManager {
  private static instance: FeatureManager;
  private features = new Map<string, RegisteredFeature>();
  private dependencies: FeatureDependencies;
  private videoObserver?: IVideoObserver;

  private constructor(
    logger: ILogger,
    storage: IStorage,
    errorHandler: IErrorHandler
  ) {
    this.dependencies = { logger, storage, errorHandler };
  }

  static getInstance(
    logger: ILogger,
    storage: IStorage,
    errorHandler: IErrorHandler
  ): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager(
        logger,
        storage,
        errorHandler
      );
    }
    return FeatureManager.instance;
  }

  /**
   * Set video observer
   */
  setVideoObserver(videoObserver: IVideoObserver): void {
    this.videoObserver = videoObserver;
  }

  /**
   * Register a feature
   */
  register(config: FeatureConfig, factory: FeatureFactory): void {
    if (this.features.has(config.id)) {
      this.dependencies.logger.warn(
        `Feature already registered: ${config.id}`
      );
      return;
    }

    this.dependencies.logger.debug(`Registering feature: ${config.id}`);

    this.features.set(config.id, {
      config,
      factory,
    });
  }

  /**
   * Initialize all features
   */
  async initialize(): Promise<void> {
    try {
      this.dependencies.logger.info('Initializing FeatureManager');

      // Sort features by priority (higher first)
      const sortedFeatures = Array.from(this.features.entries()).sort(
        ([, a], [, b]) => (b.config.priority ?? 5) - (a.config.priority ?? 5)
      );

      // Initialize each feature
      for (const [id, registered] of sortedFeatures) {
        try {
          // Create instance
          const instance = registered.factory(this.dependencies);
          registered.instance = instance;

          // Initialize
          await instance.initialize();

          // Subscribe to video observer if needed
          if (registered.config.useVideoObserver && this.videoObserver) {
            this.videoObserver.onVideoDetected((video) => {
              if (instance.isEnabled()) {
                instance.processVideo(video);
              }
            });
          }
        } catch (error) {
          this.dependencies.errorHandler.handle(error as Error, {
            feature: id,
            action: 'initialize',
          });
        }
      }

      // Start video observer
      if (this.videoObserver) {
        this.videoObserver.start();
      }

      this.dependencies.logger.info('FeatureManager initialized');
    } catch (error) {
      this.dependencies.errorHandler.handle(error as Error, {
        action: 'initializeFeatureManager',
      });
    }
  }

  /**
   * Enable a feature
   */
  async enableFeature(id: string): Promise<void> {
    const registered = this.features.get(id);

    if (!registered) {
      throw new Error(`Feature not found: ${id}`);
    }

    if (!registered.instance) {
      throw new Error(`Feature not initialized: ${id}`);
    }

    await registered.instance.enable();
  }

  /**
   * Disable a feature
   */
  async disableFeature(id: string): Promise<void> {
    const registered = this.features.get(id);

    if (!registered) {
      throw new Error(`Feature not found: ${id}`);
    }

    if (!registered.instance) {
      throw new Error(`Feature not initialized: ${id}`);
    }

    await registered.instance.disable();
  }

  /**
   * Get a feature instance
   */
  getFeature(id: string): IFeature | undefined {
    return this.features.get(id)?.instance;
  }

  /**
   * Get all feature instances
   */
  getAllFeatures(): IFeature[] {
    return Array.from(this.features.values())
      .map((f) => f.instance)
      .filter((f): f is IFeature => f !== undefined);
  }

  /**
   * Destroy all features
   */
  destroy(): void {
    try {
      this.dependencies.logger.info('Destroying FeatureManager');

      // Stop video observer
      this.videoObserver?.stop();

      // Destroy each feature
      this.features.forEach((registered) => {
        try {
          registered.instance?.destroy();
        } catch (error) {
          this.dependencies.logger.error(
            `Error destroying feature: ${registered.config.id}`,
            error as Error
          );
        }
      });

      this.features.clear();

      this.dependencies.logger.info('FeatureManager destroyed');
    } catch (error) {
      this.dependencies.errorHandler.handle(error as Error, {
        action: 'destroyFeatureManager',
      });
    }
  }
}
