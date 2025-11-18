/**
 * Feature Manager - Manages feature lifecycle
 * Handles initialization, cleanup, and video processing
 */

import { logger } from '@services/Logger';
import { storageService } from '@services/StorageService';
import { messageService } from '@services/MessageService';
import { videoObserver } from '@core/observers/VideoObserver';
import { featureRegistry } from './FeatureRegistry';
import { featureLoader } from './FeatureLoader';
import { MessageType } from '@/types/global';
import type { IFeature } from '@/types/features';

export class FeatureManager {
  private static instance: FeatureManager;
  private activeFeatures: Map<string, IFeature> = new Map();
  private panicMode: boolean = false;

  private constructor() {
    this.setupMessageHandlers();
    this.setupStorageListener();
  }

  public static getInstance(): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager();
    }
    return FeatureManager.instance;
  }

  /**
   * Initialize the feature manager
   */
  public async initialize(): Promise<void> {
    logger.info('FeatureManager', 'Initializing...');

    // Check panic mode
    this.panicMode = await storageService.get('instabits_panic_mode', false);

    if (this.panicMode) {
      logger.warn('FeatureManager', 'Panic mode is enabled - features disabled');
      return;
    }

    // Get all feature IDs
    const allFeatureIds = featureRegistry.getAllIds();

    // Get enabled features from storage
    const featureStates = await storageService.getAllFeatureStates(allFeatureIds);

    const enabledFeatureIds = Object.entries(featureStates)
      .filter(([_, enabled]) => enabled)
      .map(([id]) => id);

    logger.info('FeatureManager', `Enabled features: ${enabledFeatureIds.length}/${allFeatureIds.length}`);

    // Load and initialize enabled features
    await this.loadEnabledFeatures(enabledFeatureIds);

    // Start video observer
    videoObserver.start();

    // Subscribe to video notifications
    videoObserver.subscribe(this.handleNewVideo.bind(this));

    logger.info('FeatureManager', 'Initialization complete');
  }

  /**
   * Load and initialize enabled features
   */
  private async loadEnabledFeatures(featureIds: string[]): Promise<void> {
    if (featureIds.length === 0) {
      logger.info('FeatureManager', 'No features to load');
      return;
    }

    logger.group('Loading Features');

    // Load features
    const loadedFeatures = await featureLoader.loadFeatures(featureIds);

    // Initialize each feature
    for (const [featureId, feature] of loadedFeatures) {
      try {
        await feature.initialize();
        this.activeFeatures.set(featureId, feature);
        logger.info('FeatureManager', `✓ Initialized: ${feature.name}`);
      } catch (error) {
        logger.error('FeatureManager', `✗ Failed to initialize: ${featureId}`, error);
      }
    }

    logger.groupEnd();

    logger.info('FeatureManager', `Active features: ${this.activeFeatures.size}`);
  }

  /**
   * Handle new video detected
   */
  private handleNewVideo(video: HTMLVideoElement): void {
    if (this.panicMode) {
      return;
    }

    logger.debug('FeatureManager', 'Processing new video');

    this.activeFeatures.forEach((feature) => {
      try {
        feature.processVideo(video);
      } catch (error) {
        logger.error('FeatureManager', `Error processing video in ${feature.id}`, error);
      }
    });
  }

  /**
   * Enable a feature
   */
  public async enableFeature(featureId: string): Promise<boolean> {
    if (this.activeFeatures.has(featureId)) {
      logger.warn('FeatureManager', `Feature ${featureId} already enabled`);
      return true;
    }

    logger.info('FeatureManager', `Enabling feature: ${featureId}`);

    try {
      // Load feature
      const feature = await featureLoader.loadFeature(featureId);
      if (!feature) {
        throw new Error('Failed to load feature');
      }

      // Initialize feature
      await feature.initialize();

      // Add to active features
      this.activeFeatures.set(featureId, feature);

      // Process existing videos
      const videos = document.querySelectorAll<HTMLVideoElement>('video');
      videos.forEach((video) => {
        try {
          feature.processVideo(video);
        } catch (error) {
          logger.error('FeatureManager', `Error processing existing video`, error);
        }
      });

      // Save state
      await storageService.setFeatureState(featureId, true);

      logger.info('FeatureManager', `✓ Enabled: ${feature.name}`);

      return true;
    } catch (error) {
      logger.error('FeatureManager', `Failed to enable ${featureId}`, error);
      return false;
    }
  }

  /**
   * Disable a feature
   */
  public async disableFeature(featureId: string): Promise<boolean> {
    const feature = this.activeFeatures.get(featureId);
    if (!feature) {
      logger.warn('FeatureManager', `Feature ${featureId} not active`);
      return true;
    }

    logger.info('FeatureManager', `Disabling feature: ${featureId}`);

    try {
      // Call cleanup
      feature.onCleanup();

      // Remove from active features
      this.activeFeatures.delete(featureId);

      // Unload from loader
      featureLoader.unloadFeature(featureId);

      // Save state
      await storageService.setFeatureState(featureId, false);

      logger.info('FeatureManager', `✓ Disabled: ${feature.name}`);

      return true;
    } catch (error) {
      logger.error('FeatureManager', `Failed to disable ${featureId}`, error);
      return false;
    }
  }

  /**
   * Toggle panic mode
   */
  public async togglePanicMode(enabled: boolean): Promise<void> {
    this.panicMode = enabled;
    await storageService.set('instabits_panic_mode', enabled);

    if (enabled) {
      logger.warn('FeatureManager', 'Panic mode ENABLED - disabling all features');

      // Cleanup all features
      this.activeFeatures.forEach((feature) => {
        try {
          feature.onCleanup();
        } catch (error) {
          logger.error('FeatureManager', `Error cleaning up ${feature.id}`, error);
        }
      });

      this.activeFeatures.clear();
      videoObserver.stop();
    } else {
      logger.info('FeatureManager', 'Panic mode DISABLED - reinitializing');
      await this.initialize();
    }
  }

  /**
   * Setup message handlers
   */
  private setupMessageHandlers(): void {
    messageService.on(MessageType.PANIC_MODE, async (enabled: boolean) => {
      await this.togglePanicMode(enabled);
    });

    messageService.on(MessageType.RELOAD_FEATURES, async () => {
      logger.info('FeatureManager', 'Reloading features...');

      // Cleanup current features
      this.activeFeatures.forEach((feature) => feature.onCleanup());
      this.activeFeatures.clear();

      // Reinitialize
      await this.initialize();
    });
  }

  /**
   * Setup storage listener
   */
  private setupStorageListener(): void {
    storageService.addChangeListener(async (event) => {
      // Handle feature state changes
      if (event.key.startsWith('instabits_feature_')) {
        const featureId = event.key.replace('instabits_feature_', '');
        const enabled = event.newValue === true;

        if (enabled) {
          await this.enableFeature(featureId);
        } else {
          await this.disableFeature(featureId);
        }
      }
    });
  }

  /**
   * Get active features
   */
  public getActiveFeatures(): Map<string, IFeature> {
    return new Map(this.activeFeatures);
  }

  /**
   * Check if feature is active
   */
  public isActive(featureId: string): boolean {
    return this.activeFeatures.has(featureId);
  }
}

// Export singleton instance
export const featureManager = FeatureManager.getInstance();
