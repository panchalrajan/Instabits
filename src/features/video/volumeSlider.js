/**
 * VolumeSlider - Volume control feature for Instagram videos
 *
 * Features:
 * - Independent volume (0-100) and mute state management
 * - Auto-sync between slider and mute button
 * - Persistent storage of both states
 * - Enable/disable toggle support
 * - Respects Instagram's native mute state on first load
 */
class VolumeSlider extends BaseFeature {
  constructor() {
    super();

    // State management
    this.volumeValue = 100; // 0-100
    this.muteState = false; // true = muted, false = unmuted
    this.extensionEnabled = true; // Feature enabled/disabled
    this.isFirstInstall = false;

    // Keep a Set of all tracked videos for iteration (WeakMap can't be iterated)
    this.allVideos = new Set();

    // Debounce storage saves to avoid quota limits
    this.saveDebounceTimer = null;
    this.saveDebounceDelay = 300; // 300ms delay

    // Prevent concurrent mute operations
    this.isProcessingMute = false;
  }

  async initialize() {
    // Load feature enabled state
    this.extensionEnabled = await storageService.getUserPreference('volumeSlider', true);

    // Check if this is first install (no saved volume exists)
    const savedVolume = await storageService.getUserPreference('volumeValue', null);
    this.isFirstInstall = savedVolume === null;

    // Load saved states
    await this.loadSettings();
  }

  async loadSettings() {
    // Load volume value (default 100)
    this.volumeValue = await storageService.getUserPreference('volumeValue', 100);

    // Load mute state (default false = unmuted)
    this.muteState = await storageService.getUserPreference('muteState', false);
  }

  async saveVolumeValue(value) {
    this.volumeValue = value;
    this.debouncedSave();
  }

  async saveMuteState(muted) {
    this.muteState = muted;
    this.debouncedSave();
  }

  /**
   * Debounced save to avoid exceeding Chrome storage quota
   */
  debouncedSave() {
    // Clear existing timer
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    // Set new timer
    this.saveDebounceTimer = setTimeout(async () => {
      await this.saveToStorage();
    }, this.saveDebounceDelay);
  }

  /**
   * Actually save to storage (called by debounced method)
   */
  async saveToStorage() {
    await storageService.setUserPreference('volumeValue', this.volumeValue);
    await storageService.setUserPreference('muteState', this.muteState);
  }

  async saveSettings() {
    await this.saveToStorage();
  }

  /**
   * Get current Instagram mute state from audio button
   */
  getInstagramMuteState(audioButton) {
    const svg = audioButton.querySelector('svg[aria-label]');
    if (svg) {
      const ariaLabel = svg.getAttribute('aria-label');
      // "Audio is muted" = muted, "Audio is playing" = unmuted
      return ariaLabel && ariaLabel.toLowerCase().includes('muted');
    }
    return false;
  }

  /**
   * Set Instagram mute state by clicking the audio button
   */
  setInstagramMuteState(audioButton, shouldMute) {
    const currentlyMuted = this.getInstagramMuteState(audioButton);

    // Only click if state needs to change
    if (currentlyMuted !== shouldMute) {
      audioButton.click();
    }
  }

  /**
   * Create volume slider UI
   */
  createVolumeSlider() {
    const container = this.createContainer('insta-volume-slider-container');

    const track = document.createElement('div');
    track.className = 'insta-volume-slider-track';

    const fill = document.createElement('div');
    fill.className = 'insta-volume-slider-fill';
    // Show 0 if muted, otherwise show actual volume
    const displayValue = this.muteState ? 0 : this.volumeValue;
    fill.style.height = `${displayValue}%`;

    const thumb = document.createElement('div');
    thumb.className = 'insta-volume-slider-thumb';
    thumb.style.bottom = `${displayValue}%`;

    track.appendChild(fill);
    track.appendChild(thumb);
    container.appendChild(track);

    return { container, track, fill, thumb };
  }

  /**
   * Update slider UI
   * @param {HTMLElement} fill - Fill element
   * @param {HTMLElement} thumb - Thumb element
   * @param {number} volumeValue - Volume value (0-100)
   * @param {boolean} isMuted - Whether video is muted (overrides visual to 0)
   */
  updateSliderUI(fill, thumb, volumeValue, isMuted = null) {
    // If muted, show slider at 0 visually, otherwise show actual volume
    const displayValue = (isMuted !== null ? isMuted : this.muteState) ? 0 : volumeValue;
    const percentage = Math.max(0, Math.min(100, displayValue));
    fill.style.height = `${percentage}%`;
    thumb.style.bottom = `${percentage}%`;
  }

  /**
   * Update all sliders to match current volume value
   * @param {boolean} updateButtons - Whether to click Instagram mute buttons (default: false to avoid loops)
   */
  updateAllSliders(updateButtons = false) {
    this.allVideos.forEach(video => {
      const data = this.trackedVideos.get(video);
      if (!data) return;

      const { fill, thumb, audioButton } = data;
      if (fill && thumb) {
        // Pass mute state to show correct visual
        this.updateSliderUI(fill, thumb, this.volumeValue, this.muteState);
      }

      // Update video volume based on mute state
      if (this.muteState) {
        video.volume = 0;
        // Only click buttons if explicitly requested (to avoid infinite loops)
        if (updateButtons) {
          this.setInstagramMuteState(audioButton, true);
        }
      } else {
        video.volume = this.volumeValue / 100;
        if (updateButtons) {
          this.setInstagramMuteState(audioButton, false);
        }
      }
    });
  }

  /**
   * Set volume from slider interaction
   */
  async setVolumeFromSlider(event, track, video, fill, thumb, audioButton) {
    const rect = track.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const percentage = 1 - (clickY / rect.height);
    const volumeValue = Math.max(0, Math.min(100, Math.round(percentage * 100)));

    // Update volume value
    await this.saveVolumeValue(volumeValue);

    // Auto-sync mute state based on slider position
    if (volumeValue === 0) {
      // Slider at 0 → Auto-mute
      if (!this.muteState) {
        await this.saveMuteState(true);
      }
    } else {
      // Slider > 0 → Auto-unmute
      if (this.muteState) {
        await this.saveMuteState(false);
      }
    }

    // Update ALL videos and sliders to match (and update Instagram buttons)
    this.updateAllSliders(true);
  }

  /**
   * Handle Instagram native mute button click
   */
  async handleNativeMuteClick(audioButton, video, fill, thumb) {
    // Prevent concurrent processing
    if (this.isProcessingMute) {
      return;
    }

    this.isProcessingMute = true;

    // Small delay to let Instagram update the aria-label
    setTimeout(async () => {
      try {
        const isMuted = this.getInstagramMuteState(audioButton);

        // Save the new mute state
        await this.saveMuteState(isMuted);

        // Update ALL videos and sliders to match the new mute state
        // Do NOT click buttons (updateButtons = false) to avoid infinite loop
        this.updateAllSliders(false);
      } finally {
        // Release lock after a short delay
        setTimeout(() => {
          this.isProcessingMute = false;
        }, 100);
      }
    }, 50);
  }

  /**
   * Position slider relative to audio button
   */
  positionSlider(container, audioButton) {
    const isReelsFeed = this.isReelsFeed();

    if (isReelsFeed) {
      // Reels feed (/reels/): Position below the button
      container.style.bottom = 'auto';
      container.style.top = '56px';
    } else {
      // Single reel (/reel/) or Normal/Feed: Position above the button
      container.style.top = 'auto';
      container.style.bottom = '48px';
    }
  }

  /**
   * Find Instagram's audio button
   */
  findAudioButton(videoParent) {
    // Find button elements with audio aria-label
    const buttons = videoParent.querySelectorAll('button');
    for (const button of buttons) {
      const ariaLabel = button.getAttribute('aria-label');
      if (ariaLabel && (ariaLabel.toLowerCase().includes('audio') || ariaLabel.toLowerCase().includes('toggle audio'))) {
        // Ensure it's a small button (not a large container)
        const rect = button.getBoundingClientRect();
        if (rect.width < 100 && rect.height < 100) {
          return button;
        }
      }
    }

    // Find div elements with role="button" containing SVGs with audio aria-label
    const divButtons = videoParent.querySelectorAll('div[role="button"]');
    for (const div of divButtons) {
      const svg = div.querySelector('svg');
      if (svg) {
        const ariaLabel = svg.getAttribute('aria-label');
        if (ariaLabel && (ariaLabel.toLowerCase().includes('audio') || ariaLabel.toLowerCase().includes('muted') || ariaLabel.toLowerCase().includes('playing'))) {
          // Ensure it's a small button (not a large container)
          const rect = div.getBoundingClientRect();
          if (rect.width < 100 && rect.height < 100) {
            return div;
          }
        }
      }
    }

    return null;
  }

  /**
   * Process video element and add volume control
   */
  processVideo(video) {
    if (!video || this.isVideoTracked(video)) {
      return null;
    }

    // Check if feature is enabled
    if (!this.extensionEnabled) {
      return null;
    }

    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    const audioButton = this.findAudioButton(videoParent);
    if (!audioButton) {
      return null;
    }

    // Handle first install state detection
    if (this.isFirstInstall) {
      const igMuted = this.getInstagramMuteState(audioButton);

      if (igMuted) {
        // Video starts muted → slider = 0
        this.volumeValue = 0;
        this.muteState = true;
      } else {
        // Video starts unmuted → slider = 100
        this.volumeValue = 100;
        this.muteState = false;
      }

      // Save initial state
      this.saveSettings();
      this.isFirstInstall = false; // Only do this once
    }

    // Apply saved volume and mute state
    if (this.muteState) {
      video.volume = 0;
      this.setInstagramMuteState(audioButton, true);
    } else {
      video.volume = this.volumeValue / 100;
      this.setInstagramMuteState(audioButton, false);
    }

    // Create slider UI
    const { container, track, fill, thumb } = this.createVolumeSlider();
    videoParent.appendChild(container);

    // Position slider
    this.positionSlider(container, audioButton);

    // Track this video
    this.addToTrackedVideos(video, { container, track, fill, thumb, audioButton, videoParent });
    this.allVideos.add(video);

    // Show/hide slider on hover
    let hideTimeout = null;

    const showSlider = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      container.classList.add('visible');
    };

    const hideSlider = () => {
      hideTimeout = setTimeout(() => {
        container.classList.remove('visible');
      }, 300);
    };

    audioButton.addEventListener('mouseenter', showSlider);
    audioButton.addEventListener('mouseleave', hideSlider);
    container.addEventListener('mouseenter', showSlider);
    container.addEventListener('mouseleave', hideSlider);

    // Slider interaction handlers
    const handleClick = (e) => {
      e.stopPropagation();
      this.setVolumeFromSlider(e, track, video, fill, thumb, audioButton);
    };

    track.addEventListener('click', handleClick);

    let isDragging = false;

    const handleMouseDown = (e) => {
      e.stopPropagation();
      isDragging = true;
      this.setVolumeFromSlider(e, track, video, fill, thumb, audioButton);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        e.stopPropagation();
        this.setVolumeFromSlider(e, track, video, fill, thumb, audioButton);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    track.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Listen for native Instagram mute button clicks
    audioButton.addEventListener('click', () => {
      this.handleNativeMuteClick(audioButton, video, fill, thumb);
    });

    // Cleanup on video removal
    this.setupCleanupObserver(video, () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      this.allVideos.delete(video);
    });

    return { container, track, fill, thumb };
  }

  /**
   * Enable the feature
   */
  async enable() {
    this.extensionEnabled = true;
    await storageService.setUserPreference('volumeSlider', true);

    // Re-process all videos to show sliders
    if (this.observer && this.observer.videos) {
      this.observer.videos.forEach(video => {
        if (!this.isVideoTracked(video)) {
          this.processVideo(video);
        }
      });
    }
  }

  /**
   * Disable the feature
   */
  async disable() {
    this.extensionEnabled = false;

    // Clear any pending debounced saves
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }

    // Save current state immediately before disabling
    await this.saveToStorage();
    await storageService.setUserPreference('volumeSlider', false);

    // Hide all sliders and restore Instagram native behavior
    this.allVideos.forEach(video => {
      const data = this.trackedVideos.get(video);
      if (!data) return;

      const { container } = data;

      // Hide slider
      if (container && container.parentNode) {
        container.remove();
      }

      // Restore Instagram's native volume based on current mute state
      if (this.muteState) {
        // If muted → set volume to 0
        video.volume = 0;
      } else {
        // If unmuted → set volume to MAX (100%)
        video.volume = 1.0;
      }
    });

    // Clear tracked videos
    this.allVideos.clear();
  }

  /**
   * Cleanup - called when feature is disabled
   */
  cleanup() {
    // Clear any pending debounced saves
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }

    this.allVideos.forEach(video => {
      const data = this.trackedVideos.get(video);
      if (!data) return;

      const { container } = data;

      // Hide slider
      if (container && container.parentNode) {
        container.remove();
      }

      // Restore Instagram's native volume based on current mute state
      if (this.muteState) {
        // If muted → set volume to 0
        video.volume = 0;
      } else {
        // If unmuted → set volume to MAX (100%)
        video.volume = 1.0;
      }
    });

    this.allVideos.clear();
  }
}
