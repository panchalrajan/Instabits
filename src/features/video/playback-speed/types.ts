/**
 * Playback Speed feature types
 */

export interface PlaybackSpeedConfig {
  enabledSpeeds: number[];
  currentSpeed: number;
}

export interface TrackedVideoData {
  button: HTMLButtonElement;
  overlay: HTMLDivElement;
  currentSpeedDisplay: HTMLSpanElement;
}
