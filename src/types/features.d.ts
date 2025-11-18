/**
 * Feature-specific type definitions
 */

/**
 * Feature metadata for dynamic loading
 */
export interface FeatureMetadata {
  id: string;
  name: string;
  description: string;
  category: 'video' | 'automation';
  version: string;
  dependencies?: string[];
}

/**
 * Base feature interface that all features must implement
 */
export interface IFeature {
  readonly id: string;
  readonly name: string;

  /**
   * Initialize the feature with saved settings
   */
  initialize(): Promise<void>;

  /**
   * Process a video element
   */
  processVideo(video: HTMLVideoElement): void;

  /**
   * Cleanup when feature is disabled
   */
  onCleanup(): void;

  /**
   * Handle settings change
   */
  onSettingsChange?(settings: Record<string, any>): void;
}

/**
 * Feature constructor type
 */
export interface FeatureConstructor {
  new (): IFeature;
}

/**
 * Video observer callback
 */
export type VideoCallback = (video: HTMLVideoElement) => void;

/**
 * UI control position types
 */
export type ControlPosition = 'left' | 'center' | 'right';

/**
 * UI control configuration
 */
export interface ControlConfig {
  element: HTMLElement;
  position: ControlPosition;
  order: number;
  featureId: string;
}
