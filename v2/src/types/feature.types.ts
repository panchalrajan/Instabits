/**
 * Feature Type Definitions
 * Interfaces for feature implementation following Open/Closed Principle
 */

import type { ILogger, IStorage, IErrorHandler } from './service.types';

export interface IFeature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priority: number;

  initialize(): Promise<void>;
  enable(): Promise<void>;
  disable(): Promise<void>;
  destroy(): void;

  isEnabled(): boolean;
  processVideo(video: HTMLVideoElement): void;
}

export interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  priority?: number;
  enabled?: boolean;
  useVideoObserver?: boolean;
  dependencies?: string[];
}

export interface FeatureDependencies {
  logger: ILogger;
  storage: IStorage;
  errorHandler: IErrorHandler;
}

export interface IFeatureManager {
  register(config: FeatureConfig, factory: FeatureFactory): void;
  initialize(): Promise<void>;
  enableFeature(id: string): Promise<void>;
  disableFeature(id: string): Promise<void>;
  getFeature(id: string): IFeature | undefined;
  getAllFeatures(): IFeature[];
  destroy(): void;
}

export type FeatureFactory = (deps: FeatureDependencies) => IFeature;

export enum FeatureCategory {
  VIDEO = 'video',
  AUTOMATION = 'automation',
  UI = 'ui',
  PRIVACY = 'privacy',
}

export interface FeatureMetadata {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  icon?: string;
  color?: string;
  badge?: 'NEW' | 'BETA' | 'EXPERIMENTAL';
  hasSettings?: boolean;
  settingsPath?: string;
}

export interface VideoFeatureState {
  video: HTMLVideoElement;
  elements: Map<string, HTMLElement>;
  listeners: Map<string, EventListener>;
  cleanup: (() => void)[];
}

export interface FeatureSettings {
  [key: string]: unknown;
}

export const STORAGE_KEYS = {
  FEATURE_PREFIX: 'instabits_feature_',
  SETTINGS_PREFIX: 'instabits_settings_',
  PANIC_MODE: 'instabits_panic_mode',
} as const;

export function getFeatureStorageKey(featureId: string): string {
  return `${STORAGE_KEYS.FEATURE_PREFIX}${featureId}`;
}

export function getSettingsStorageKey(featureId: string): string {
  return `${STORAGE_KEYS.SETTINGS_PREFIX}${featureId}`;
}
