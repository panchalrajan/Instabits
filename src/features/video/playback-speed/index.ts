/**
 * Playback Speed Feature
 * Allows users to control video playback speed with customizable speed options
 */

import { BaseFeature } from '@core/feature-system/BaseFeature';
import { storageService } from '@services/StorageService';
import { videoControlsManager } from '@core/managers/VideoControlsManager';
import { FEATURE_IDS } from '@utils/constants';
import { PLAYBACK_SPEED_CONFIG } from './config';
import type { PlaybackSpeedConfig, TrackedVideoData } from './types';

export default class PlaybackSpeedFeature extends BaseFeature {
  public readonly id = FEATURE_IDS.PLAYBACK_SPEED;
  public readonly name = 'Playback Speed';

  private config: PlaybackSpeedConfig = {
    enabledSpeeds: [...PLAYBACK_SPEED_CONFIG.ALL_SPEEDS],
    currentSpeed: PLAYBACK_SPEED_CONFIG.DEFAULT_SPEED,
  };

  private videoData: WeakMap<HTMLVideoElement, TrackedVideoData> = new WeakMap();

  public async initialize(): Promise<void> {
    await this.loadSettings();
    this.log('Initialized with config:', this.config);
  }

  private async loadSettings(): Promise<void> {
    const [enabledSpeeds, currentSpeed] = await Promise.all([
      storageService.getUserPreference<number[]>(
        PLAYBACK_SPEED_CONFIG.STORAGE_KEYS.ENABLED_SPEEDS,
        [...PLAYBACK_SPEED_CONFIG.ALL_SPEEDS]
      ),
      storageService.getUserPreference<number>(
        PLAYBACK_SPEED_CONFIG.STORAGE_KEYS.CURRENT_SPEED,
        PLAYBACK_SPEED_CONFIG.DEFAULT_SPEED
      ),
    ]);

    this.config.enabledSpeeds = enabledSpeeds;
    this.config.currentSpeed = currentSpeed;
  }

  public processVideo(video: HTMLVideoElement): void {
    if (this.isTracked(video)) return;

    this.debug('Processing video');

    // Set initial playback rate
    video.playbackRate = this.config.currentSpeed;

    // Create UI elements
    const button = this.createSpeedButton();
    const overlay = this.createSpeedOverlay();

    // Setup interaction
    this.setupInteraction(button, overlay, video);

    // Register with controls manager
    videoControlsManager.register(video, this.id, button, 'left', 1);

    // Track video data
    this.videoData.set(video, {
      button,
      overlay,
      currentSpeedDisplay: button.querySelector('.speed-value')!,
    });

    this.markAsTracked(video);

    // Setup cleanup
    this.setupCleanupObserver(video, [button, overlay]);
  }

  private createSpeedButton(): HTMLButtonElement {
    const button = this.createButton({
      className: 'instabits-speed-btn',
      title: 'Playback Speed',
    });

    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span class="speed-value">${this.config.currentSpeed}x</span>
    `;

    // Add styles
    Object.assign(button.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '8px 12px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.2s',
    });

    return button;
  }

  private createSpeedOverlay(): HTMLDivElement {
    const overlay = this.createContainer({
      className: 'instabits-speed-overlay',
    });

    const speeds = this.config.enabledSpeeds.sort((a, b) => a - b);

    overlay.innerHTML = `
      <div class="speed-title">Playback Speed</div>
      <div class="speed-options">
        ${speeds
          .map(
            (speed) => `
          <button
            class="speed-option ${speed === this.config.currentSpeed ? 'active' : ''}"
            data-speed="${speed}"
          >
            ${speed}x
          </button>
        `
          )
          .join('')}
      </div>
    `;

    // Add styles
    Object.assign(overlay.style, {
      position: 'absolute',
      bottom: '60px',
      left: '12px',
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '160px',
      display: 'none',
      zIndex: '100',
    });

    this.styleOverlayElements(overlay);

    return overlay;
  }

  private styleOverlayElements(overlay: HTMLDivElement): void {
    const title = overlay.querySelector('.speed-title') as HTMLElement;
    if (title) {
      Object.assign(title.style, {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
      });
    }

    const options = overlay.querySelector('.speed-options') as HTMLElement;
    if (options) {
      Object.assign(options.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '6px',
      });
    }

    const optionButtons = overlay.querySelectorAll('.speed-option');
    optionButtons.forEach((btn) => {
      const button = btn as HTMLButtonElement;
      Object.assign(button.style, {
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid transparent',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'all 0.2s',
      });

      if (button.classList.contains('active')) {
        button.style.background = '#6366f1';
        button.style.fontWeight = '600';
      }
    });
  }

  private setupInteraction(
    button: HTMLButtonElement,
    overlay: HTMLDivElement,
    video: HTMLVideoElement
  ): void {
    let isOpen = false;

    // Toggle overlay
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      overlay.style.display = isOpen ? 'block' : 'none';
    });

    // Handle speed selection
    overlay.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('speed-option')) {
        const speed = parseFloat(target.dataset.speed || '1.0');

        // Update video playback rate
        video.playbackRate = speed;

        // Update UI
        const speedDisplay = this.videoData.get(video)?.currentSpeedDisplay;
        if (speedDisplay) {
          speedDisplay.textContent = `${speed}x`;
        }

        // Update active state
        overlay.querySelectorAll('.speed-option').forEach((opt) => {
          const btn = opt as HTMLButtonElement;
          const isActive = parseFloat(btn.dataset.speed || '0') === speed;
          btn.classList.toggle('active', isActive);
          btn.style.background = isActive ? '#6366f1' : 'rgba(255, 255, 255, 0.1)';
          btn.style.fontWeight = isActive ? '600' : '500';
        });

        // Save speed
        this.config.currentSpeed = speed;
        await storageService.setUserPreference(
          PLAYBACK_SPEED_CONFIG.STORAGE_KEYS.CURRENT_SPEED,
          speed
        );

        // Close overlay
        isOpen = false;
        overlay.style.display = 'none';

        this.debug(`Speed changed to ${speed}x`);
      }
    });

    // Close overlay on outside click
    document.addEventListener('click', (e) => {
      if (isOpen && !button.contains(e.target as Node) && !overlay.contains(e.target as Node)) {
        isOpen = false;
        overlay.style.display = 'none';
      }
    });

    // Append overlay to parent
    const parent = this.getParentElement(video);
    if (parent) {
      parent.appendChild(overlay);
    }
  }

  public onCleanup(): void {
    this.log('Cleaning up');
    this.disconnectAllObservers();
  }
}
