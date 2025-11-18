/**
 * Content Script Entry Point
 * Initializes all services and features
 */

import { Logger } from '@services/logging/Logger';
import { ErrorHandler } from '@services/error/ErrorHandler';
import { StorageService } from '@services/storage/StorageService';
import { CacheService } from '@services/storage/CacheService';
import { MessageService } from '@services/messaging/MessageService';
import { VideoObserver } from '@services/dom/VideoObserver';
import { DOMUtils } from '@services/dom/DOMUtils';
import { EventBus } from '@core/EventBus';
import { ServiceContainer } from '@core/ServiceContainer';
import { FeatureManager } from '@core/FeatureManager';
import { LogLevel } from '@app-types';

// Feature factories
import { createFullscreenFeature } from '@features/video/FullscreenFeature';
import { createPlaybackSpeedFeature } from '@features/video/PlaybackSpeedFeature';
import { createPiPModeFeature } from '@features/video/PiPModeFeature';
import { createVideoDurationFeature } from '@features/video/VideoDurationFeature';
import { createSeekbarFeature } from '@features/video/SeekbarFeature';
import { createVolumeControlFeature } from '@features/video/VolumeControlFeature';
import { createZenModeFeature } from '@features/video/ZenModeFeature';
import { createBackgroundPlayFeature } from '@features/video/BackgroundPlayFeature';
import { createAutoScrollFeature } from '@features/automation/AutoScrollFeature';

/**
 * Initialize the extension
 */
async function initialize(): Promise<void> {
  try {
    console.log('[InstaBits] Initializing v2.0...');

    // 1. Initialize core services
    const logger = Logger.getInstance();
    logger.setLevel(LogLevel.INFO);

    const errorHandler = ErrorHandler.getInstance(logger);
    errorHandler.setGlobalHandler();

    const cache = new CacheService(5000);
    const storage = StorageService.getInstance(logger, cache);
    const messageService = MessageService.getInstance(logger);
    const videoObserver = VideoObserver.getInstance(logger);
    const domUtils = DOMUtils.getInstance(logger);
    const eventBus = EventBus.getInstance(logger);

    // 2. Register services in container
    const container = ServiceContainer.getInstance();
    container.register('logger', logger);
    container.register('errorHandler', errorHandler);
    container.register('storage', storage);
    container.register('messageService', messageService);
    container.register('videoObserver', videoObserver);
    container.register('domUtils', domUtils);
    container.register('eventBus', eventBus);

    logger.info('Core services initialized');

    // 3. Initialize Feature Manager
    const featureManager = FeatureManager.getInstance(
      logger,
      storage,
      errorHandler
    );

    featureManager.setVideoObserver(videoObserver);

    // 4. Register features (in priority order)
    const features = [
      createFullscreenFeature,           // Priority 10
      createPlaybackSpeedFeature,        // Priority 9
      createPiPModeFeature,              // Priority 8
      createVideoDurationFeature,        // Priority 7
      createSeekbarFeature,              // Priority 6
      createVolumeControlFeature,        // Priority 5 (changed from 8)
      createZenModeFeature,              // Priority 4
      createBackgroundPlayFeature,       // Priority 3
      createAutoScrollFeature,           // Priority 2
    ];

    features.forEach((factory) => {
      const feature = factory({ logger, storage, errorHandler});
      const useVideoObserver = feature.id !== 'zenMode' && feature.id !== 'backgroundPlay';

      featureManager.register(
        {
          id: feature.id,
          name: feature.name,
          description: feature.description,
          priority: feature.priority,
          useVideoObserver,
        },
        () => feature
      );
    });

    logger.info(`Registered ${features.length} features`);

    // 5. Initialize features
    await featureManager.initialize();

    logger.info('✓ InstaBits v2.0 initialized successfully');

    // 6. Setup cleanup on page unload
    window.addEventListener('beforeunload', () => {
      featureManager.destroy();
      logger.info('InstaBits cleaned up');
    });
  } catch (error) {
    console.error('[InstaBits] Initialization error:', error);
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Export for debugging
(window as any).__instabits__ = {
  version: '2.0.0',
  getContainer: () => ServiceContainer.getInstance(),
  getFeatureManager: () => {
    const container = ServiceContainer.getInstance();
    return FeatureManager.getInstance(
      container.get('logger'),
      container.get('storage'),
      container.get('errorHandler')
    );
  },
};
