/**
 * Content Script Entry Point
 * Initializes the feature manager and starts the extension
 */

import { featureManager } from '@core/feature-system/FeatureManager';
import { logger } from '@services/Logger';
import { isInstagram } from '@utils/helpers';

/**
 * Main initialization function
 */
async function initialize(): Promise<void> {
  // Check if we're on Instagram
  if (!isInstagram()) {
    logger.warn('ContentScript', 'Not on Instagram, skipping initialization');
    return;
  }

  logger.info('ContentScript', 'InstaBits initializing...');

  try {
    // Initialize feature manager
    await featureManager.initialize();

    logger.info('ContentScript', '✓ InstaBits ready!');
  } catch (error) {
    logger.error('ContentScript', 'Failed to initialize', error as Error);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM is already ready
  initialize();
}

// Log that content script is loaded
logger.debug('ContentScript', 'Content script loaded');
