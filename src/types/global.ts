/**
 * Global type definitions for InstaBits Chrome Extension
 */

/**
 * Feature configuration object
 */
export interface FeatureConfig {
  id: string;
  name: string;
  enabled: boolean;
  category: 'video' | 'automation';
  loadPriority?: number;
}

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
 * Storage keys used throughout the extension
 */
export type StorageKey = `instabits_feature_${string}` | `pref_${string}` | 'instabits_panic_mode';

/**
 * Storage change event
 */
export interface StorageChangeEvent {
  key: string;
  newValue: any;
  oldValue: any;
}

/**
 * Logger levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Message types for runtime messaging
 */
export enum MessageType {
  FEATURE_TOGGLE = 'FEATURE_TOGGLE',
  FEATURE_CONFIG = 'FEATURE_CONFIG',
  STORAGE_SYNC = 'STORAGE_SYNC',
  PANIC_MODE = 'PANIC_MODE',
  RELOAD_FEATURES = 'RELOAD_FEATURES'
}

/**
 * Runtime message structure
 */
export interface RuntimeMessage<T = any> {
  type: MessageType;
  payload: T;
  timestamp: number;
}

/**
 * Feature state
 */
export interface FeatureState {
  enabled: boolean;
  config?: Record<string, any>;
}
