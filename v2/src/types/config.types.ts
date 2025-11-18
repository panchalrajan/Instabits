/**
 * Configuration Type Definitions
 * Application-wide configuration types
 */

export interface AppConfig {
  name: string;
  version: string;
  debug: boolean;
  logLevel: string;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface VideoConfig {
  observerDebounce: number;
  cleanupDelay: number;
  maxVideosTracked: number;
}

export interface UIConfig {
  controlsPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  controlsGap: number;
  animationDuration: number;
  zIndex: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  name: 'InstaBits',
  version: '2.0.0',
  debug: false,
  logLevel: 'info',
  cacheEnabled: true,
  cacheTTL: 5000, // 5 seconds
};

export const VIDEO_CONFIG: VideoConfig = {
  observerDebounce: 100,
  cleanupDelay: 500,
  maxVideosTracked: 50,
};

export const UI_CONFIG: UIConfig = {
  controlsPosition: 'top-left',
  controlsGap: 8,
  animationDuration: 200,
  zIndex: 9998,
};
