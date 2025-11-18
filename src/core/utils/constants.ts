/**
 * Shared constants for InstaBits extension
 */

/**
 * Feature IDs
 */
export const FEATURE_IDS = {
  // Video features
  PLAYBACK_SPEED: 'playbackSpeed',
  VOLUME_SLIDER: 'volumeSlider',
  SEEKBAR: 'videoSeekbar',
  DURATION: 'videoDuration',
  PIP: 'pipMode',
  FULLSCREEN: 'fullScreen',
  BACKGROUND_PLAY: 'backgroundPlay',
  ZEN_MODE: 'zenMode',

  // Automation features
  AUTO_SCROLL: 'autoScroll',
} as const;

/**
 * Feature categories
 */
export const FEATURE_CATEGORIES = {
  VIDEO: 'video',
  AUTOMATION: 'automation',
} as const;

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  PANIC_MODE: 'instabits_panic_mode',
  FEATURE_PREFIX: 'instabits_feature_',
  PREF_PREFIX: 'pref_',
} as const;

/**
 * DOM selectors
 */
export const SELECTORS = {
  VIDEO: 'video',
  INSTAGRAM_VIDEO: 'video[playsinline]',
} as const;

/**
 * Debounce delays (ms)
 */
export const DELAYS = {
  VIDEO_DETECTION: 100,
  MUTATION_OBSERVER: 50,
  STORAGE_CACHE: 5000,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  CONTROL_SPACING: 8,
  ICON_SIZE: 24,
  BUTTON_SIZE: 40,
} as const;

/**
 * Extension metadata
 */
export const EXTENSION_INFO = {
  NAME: 'InstaBits',
  VERSION: '2.0.0',
  DASHBOARD_URL: chrome.runtime.getURL('dashboard/index.html'),
} as const;
