/**
 * Feature Registry - Central registry for all features
 * Maps feature IDs to their metadata and load functions
 */

import { logger } from '@services/Logger';
import { FEATURE_IDS, FEATURE_CATEGORIES } from '@utils/constants';
import type { FeatureMetadata, FeatureConstructor } from '@/types/features';

interface FeatureRegistration {
  metadata: FeatureMetadata;
  loadFunction: () => Promise<{ default: FeatureConstructor }>;
}

export class FeatureRegistry {
  private static instance: FeatureRegistry;
  private features: Map<string, FeatureRegistration> = new Map();

  private constructor() {
    this.registerAllFeatures();
  }

  public static getInstance(): FeatureRegistry {
    if (!FeatureRegistry.instance) {
      FeatureRegistry.instance = new FeatureRegistry();
    }
    return FeatureRegistry.instance;
  }

  /**
   * Register all features with their dynamic import functions
   */
  private registerAllFeatures(): void {
    // Video features
    this.register({
      metadata: {
        id: FEATURE_IDS.PLAYBACK_SPEED,
        name: 'Playback Speed',
        description: 'Control video playback speed',
        category: FEATURE_CATEGORIES.VIDEO,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/video/playback-speed'),
    });

    this.register({
      metadata: {
        id: FEATURE_IDS.VOLUME_SLIDER,
        name: 'Volume Slider',
        description: 'Custom volume control',
        category: FEATURE_CATEGORIES.VIDEO,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/video/volume-slider'),
    });

    this.register({
      metadata: {
        id: FEATURE_IDS.SEEKBAR,
        name: 'Video Seekbar',
        description: 'Interactive progress bar',
        category: FEATURE_CATEGORIES.VIDEO,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/video/seekbar'),
    });

    this.register({
      metadata: {
        id: FEATURE_IDS.DURATION,
        name: 'Video Duration',
        description: 'Display video time',
        category: FEATURE_CATEGORIES.VIDEO,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/video/duration'),
    });

    this.register({
      metadata: {
        id: FEATURE_IDS.PIP,
        name: 'Picture-in-Picture',
        description: 'PIP mode support',
        category: FEATURE_CATEGORIES.VIDEO,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/video/pip'),
    });

    this.register({
      metadata: {
        id: FEATURE_IDS.FULLSCREEN,
        name: 'Fullscreen',
        description: 'Fullscreen button',
        category: FEATURE_CATEGORIES.VIDEO,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/video/fullscreen'),
    });

    this.register({
      metadata: {
        id: FEATURE_IDS.BACKGROUND_PLAY,
        name: 'Background Play',
        description: 'Keep videos playing',
        category: FEATURE_CATEGORIES.VIDEO,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/video/background-play'),
    });

    this.register({
      metadata: {
        id: FEATURE_IDS.ZEN_MODE,
        name: 'Zen Mode',
        description: 'Hide overlays',
        category: FEATURE_CATEGORIES.VIDEO,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/video/zen-mode'),
    });

    // Automation features
    this.register({
      metadata: {
        id: FEATURE_IDS.AUTO_SCROLL,
        name: 'Auto Scroll',
        description: 'Auto scroll reels',
        category: FEATURE_CATEGORIES.AUTOMATION,
        version: '2.0.0',
      },
      loadFunction: () => import('@features/automation/auto-scroll'),
    });

    logger.info('FeatureRegistry', `Registered ${this.features.size} features`);
  }

  /**
   * Register a feature
   */
  private register(registration: FeatureRegistration): void {
    this.features.set(registration.metadata.id, registration);
  }

  /**
   * Get feature metadata
   */
  public getMetadata(featureId: string): FeatureMetadata | undefined {
    return this.features.get(featureId)?.metadata;
  }

  /**
   * Get all feature metadata
   */
  public getAllMetadata(): FeatureMetadata[] {
    return Array.from(this.features.values()).map((reg) => reg.metadata);
  }

  /**
   * Get feature load function
   */
  public getLoadFunction(featureId: string): (() => Promise<{ default: FeatureConstructor }>) | undefined {
    return this.features.get(featureId)?.loadFunction;
  }

  /**
   * Check if feature exists
   */
  public has(featureId: string): boolean {
    return this.features.has(featureId);
  }

  /**
   * Get all feature IDs
   */
  public getAllIds(): string[] {
    return Array.from(this.features.keys());
  }

  /**
   * Get features by category
   */
  public getByCategory(category: string): FeatureMetadata[] {
    return Array.from(this.features.values())
      .filter((reg) => reg.metadata.category === category)
      .map((reg) => reg.metadata);
  }
}

// Export singleton instance
export const featureRegistry = FeatureRegistry.getInstance();
