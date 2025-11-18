/**
 * Playback Speed feature configuration
 */

export const PLAYBACK_SPEED_CONFIG = {
  ALL_SPEEDS: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0],
  DEFAULT_SPEED: 1.0,
  STORAGE_KEYS: {
    ENABLED_SPEEDS: 'enabledPlaybackSpeeds',
    CURRENT_SPEED: 'currentPlaybackSpeed',
  },
} as const;
