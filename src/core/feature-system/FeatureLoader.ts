/**
 * Feature Loader - Dynamically loads feature modules
 * Handles lazy loading and error recovery
 */

import { logger } from '@services/Logger';
import { featureRegistry } from './FeatureRegistry';
import type { IFeature } from '@/types/features';

export class FeatureLoader {
  private static instance: FeatureLoader;
  private loadedFeatures: Map<string, IFeature> = new Map();
  private loadingPromises: Map<string, Promise<IFeature>> = new Map();

  private constructor() {}

  public static getInstance(): FeatureLoader {
    if (!FeatureLoader.instance) {
      FeatureLoader.instance = new FeatureLoader();
    }
    return FeatureLoader.instance;
  }

  /**
   * Load a single feature
   */
  public async loadFeature(featureId: string): Promise<IFeature | null> {
    // Return if already loaded
    if (this.loadedFeatures.has(featureId)) {
      logger.debug('FeatureLoader', `Feature ${featureId} already loaded`);
      return this.loadedFeatures.get(featureId)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(featureId)) {
      logger.debug('FeatureLoader', `Feature ${featureId} is already loading`);
      return this.loadingPromises.get(featureId)!;
    }

    // Get load function from registry
    const loadFunction = featureRegistry.getLoadFunction(featureId);
    if (!loadFunction) {
      logger.error('FeatureLoader', `Feature ${featureId} not found in registry`);
      return null;
    }

    // Create loading promise
    const loadingPromise = this.loadFeatureModule(featureId, loadFunction);
    this.loadingPromises.set(featureId, loadingPromise);

    try {
      const feature = await loadingPromise;
      this.loadedFeatures.set(featureId, feature);
      this.loadingPromises.delete(featureId);
      logger.info('FeatureLoader', `Loaded feature: ${featureId}`);
      return feature;
    } catch (error) {
      this.loadingPromises.delete(featureId);
      logger.error('FeatureLoader', `Failed to load feature: ${featureId}`, error);
      return null;
    }
  }

  /**
   * Load feature module and instantiate
   */
  private async loadFeatureModule(
    featureId: string,
    loadFunction: () => Promise<{ default: any }>
  ): Promise<IFeature> {
    try {
      logger.debug('FeatureLoader', `Loading module for ${featureId}...`);

      const module = await loadFunction();
      const FeatureClass = module.default;

      if (!FeatureClass) {
        throw new Error(`Feature ${featureId} does not have a default export`);
      }

      // Instantiate feature
      const instance = new FeatureClass() as IFeature;

      // Validate instance
      if (!instance.id || !instance.name || typeof instance.initialize !== 'function') {
        throw new Error(`Feature ${featureId} does not implement IFeature interface`);
      }

      logger.debug('FeatureLoader', `Module loaded and instantiated: ${featureId}`);

      return instance;
    } catch (error) {
      logger.error('FeatureLoader', `Error loading module for ${featureId}`, error);
      throw error;
    }
  }

  /**
   * Load multiple features
   */
  public async loadFeatures(featureIds: string[]): Promise<Map<string, IFeature>> {
    logger.info('FeatureLoader', `Loading ${featureIds.length} features...`);

    const results = new Map<string, IFeature>();

    // Load all features in parallel
    const loadPromises = featureIds.map(async (featureId) => {
      const feature = await this.loadFeature(featureId);
      if (feature) {
        results.set(featureId, feature);
      }
    });

    await Promise.all(loadPromises);

    logger.info('FeatureLoader', `Successfully loaded ${results.size}/${featureIds.length} features`);

    return results;
  }

  /**
   * Unload a feature
   */
  public unloadFeature(featureId: string): void {
    this.loadedFeatures.delete(featureId);
    logger.debug('FeatureLoader', `Unloaded feature: ${featureId}`);
  }

  /**
   * Get loaded feature
   */
  public getLoadedFeature(featureId: string): IFeature | undefined {
    return this.loadedFeatures.get(featureId);
  }

  /**
   * Check if feature is loaded
   */
  public isLoaded(featureId: string): boolean {
    return this.loadedFeatures.has(featureId);
  }

  /**
   * Get all loaded features
   */
  public getAllLoaded(): Map<string, IFeature> {
    return new Map(this.loadedFeatures);
  }

  /**
   * Clear all loaded features
   */
  public clear(): void {
    this.loadedFeatures.clear();
    this.loadingPromises.clear();
    logger.info('FeatureLoader', 'Cleared all loaded features');
  }
}

// Export singleton instance
export const featureLoader = FeatureLoader.getInstance();
