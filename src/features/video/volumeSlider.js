class VolumeSlider extends BaseFeature {
  constructor() {
    super();
  }

  initialize() {
    // Set defaults first
    this.savedVolume = 1.0;
    this.savedMuteState = false;
    this.persistVolume = true;
    this.persistMuteState = false;

    // Load saved preferences asynchronously
    this.loadSavedPreferences();

    // Setup cross-tab sync listener
    this.setupStorageListener();

    // Setup message listener for settings updates
    this.setupMessageListener();
  }

  async loadSavedPreferences() {
    // Load persistence settings
    this.persistVolume = await storageService.getUserPreference('persistVolume', true);
    this.persistMuteState = await storageService.getUserPreference('persistMuteState', false);

    // Load volume if persistence is enabled
    if (this.persistVolume) {
      const saved = await storageService.getUserPreference('volume', 1.0);
      this.savedVolume = saved;
    }

    // Load mute state if persistence is enabled
    if (this.persistMuteState) {
      const savedMute = await storageService.getUserPreference('muteState', false);
      this.savedMuteState = savedMute;
    }
  }

  setupStorageListener() {
    // Listen for cross-tab changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;

      // Handle volume changes from other tabs
      if (changes.instabits_user_preference_volume && this.persistVolume) {
        const newVolume = changes.instabits_user_preference_volume.newValue;
        if (newVolume !== undefined) {
          this.savedVolume = newVolume;
          this.applyVolumeToAllVideos(newVolume);
        }
      }

      // Handle mute state changes from other tabs
      if (changes.instabits_user_preference_muteState && this.persistMuteState) {
        const newMuteState = changes.instabits_user_preference_muteState.newValue;
        if (newMuteState !== undefined) {
          this.savedMuteState = newMuteState;
          this.applyMuteStateToAllVideos(newMuteState);
        }
      }
    });
  }

  setupMessageListener() {
    // Listen for settings changes from dashboard
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'updateVolumeSliderSettings') {
        this.handleSettingsUpdate(message.data);
        sendResponse({ success: true });
      }
    });
  }

  async handleSettingsUpdate(settings) {
    const prevPersistVolume = this.persistVolume;
    const prevPersistMuteState = this.persistMuteState;

    this.persistVolume = settings.persistVolume;
    this.persistMuteState = settings.persistMuteState;

    // If persistence was disabled, reset to defaults
    if (prevPersistVolume && !this.persistVolume) {
      this.savedVolume = 1.0;
      this.applyVolumeToAllVideos(1.0);
      await storageService.removeUserPreference('volume');
    }

    if (prevPersistMuteState && !this.persistMuteState) {
      this.savedMuteState = false;
      await storageService.removeUserPreference('muteState');
    }

    // If persistence was enabled, load and apply saved values
    if (!prevPersistVolume && this.persistVolume) {
      await this.loadSavedPreferences();
      this.applyVolumeToAllVideos(this.savedVolume);
    }

    if (!prevPersistMuteState && this.persistMuteState) {
      await this.loadSavedPreferences();
      this.applyMuteStateToAllVideos(this.savedMuteState);
    }
  }

  applyVolumeToAllVideos(volume) {
    // Apply volume to all tracked videos
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
      try {
        video.volume = volume;
      } catch (error) {
        // Ignore errors
      }
    });
  }

  applyMuteStateToAllVideos(shouldMute) {
    // Find all audio buttons and apply mute state
    const audioButtons = document.querySelectorAll('button[aria-label*="Audio"], button[aria-label*="audio"]');
    audioButtons.forEach(button => {
      const svg = button.querySelector('svg[aria-label]');
      if (svg) {
        const currentState = svg.getAttribute('aria-label');
        const isMuted = currentState && currentState.includes('muted');

        // Only click if state doesn't match desired state
        if (shouldMute && !isMuted) {
          button.click();
        } else if (!shouldMute && isMuted) {
          button.click();
        }
      }
    });

    // Also set muted property on video elements
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
      try {
        video.muted = shouldMute;
      } catch (error) {
        // Ignore errors
      }
    });
  }

  async saveVolume(volume) {
    this.savedVolume = volume;
    if (this.persistVolume) {
      await storageService.setUserPreference('volume', volume);
    }
  }

  async saveMuteState(isMuted) {
    this.savedMuteState = isMuted;
    if (this.persistMuteState) {
      await storageService.setUserPreference('muteState', isMuted);
    }
  }

  createVolumeSlider() {
    const container = this.createContainer('insta-volume-slider-container');

    const track = document.createElement('div');
    track.className = 'insta-volume-slider-track';

    const fill = document.createElement('div');
    fill.className = 'insta-volume-slider-fill';
    fill.style.height = `${this.savedVolume * 100}%`;

    const thumb = document.createElement('div');
    thumb.className = 'insta-volume-slider-thumb';

    track.appendChild(fill);
    track.appendChild(thumb);
    container.appendChild(track);

    return { container, track, fill, thumb };
  }

  updateSlider(fill, thumb, volume) {
    const percentage = volume * 100;
    fill.style.height = `${percentage}%`;
    thumb.style.bottom = `${percentage}%`;
  }

  setVolume(event, track, video, fill, thumb) {
    const rect = track.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const percentage = 1 - (clickY / rect.height);
    const volume = Math.max(0, Math.min(1, percentage));

    // Always update video volume, even if muted
    // This ensures when user unmutes, it uses the selected volume
    video.volume = volume;
    this.saveVolume(volume);
    this.updateSlider(fill, thumb, volume);
  }

  positionSlider(container, audioButton, videoParent) {
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

  findAudioButton(videoParent) {
    // Find button elements with audio aria-label
    const buttons = videoParent.querySelectorAll('button');
    for (const button of buttons) {
      const ariaLabel = button.getAttribute('aria-label');
      if (ariaLabel && (ariaLabel.includes('audio') || ariaLabel.includes('Audio'))) {
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
        if (ariaLabel && (ariaLabel.includes('audio') || ariaLabel.includes('Audio'))) {
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

  processVideo(video) {
    if (!video || this.isVideoTracked(video)) {
      return null;
    }

    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    const audioButton = this.findAudioButton(videoParent);
    if (!audioButton) {
      return null;
    }

    // Apply saved volume to this video (only if persistence is enabled)
    if (this.persistVolume) {
      video.volume = this.savedVolume;
    }

    // Apply saved mute state (only if persistence is enabled)
    if (this.persistMuteState) {
      const svg = audioButton.querySelector('svg[aria-label]');
      if (svg) {
        const currentState = svg.getAttribute('aria-label');
        const isMuted = currentState && currentState.includes('muted');

        // Apply saved mute state if different from current state
        if (this.savedMuteState && !isMuted) {
          setTimeout(() => audioButton.click(), 100);
        } else if (!this.savedMuteState && isMuted) {
          setTimeout(() => audioButton.click(), 100);
        }
      }
    }

    // Listen for mute button clicks to save state
    const handleAudioButtonClick = () => {
      if (this.persistMuteState) {
        // Wait a bit for the state to update
        setTimeout(() => {
          const svg = audioButton.querySelector('svg[aria-label]');
          if (svg) {
            const currentState = svg.getAttribute('aria-label');
            const isMuted = currentState && currentState.includes('muted');
            this.saveMuteState(isMuted);
          }
        }, 50);
      }
    };

    audioButton.addEventListener('click', handleAudioButtonClick);

    const { container, track, fill, thumb } = this.createVolumeSlider();

    videoParent.appendChild(container);

    // Position slider relative to audio button
    this.positionSlider(container, audioButton, videoParent);

    this.addToTrackedVideos(video, { container, track, fill, thumb, audioButton, videoParent });

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

    const handleClick = (e) => {
      e.stopPropagation();
      this.setVolume(e, track, video, fill, thumb);
    };

    track.addEventListener('click', handleClick);

    let isDragging = false;

    const handleMouseDown = (e) => {
      e.stopPropagation();
      isDragging = true;
      this.setVolume(e, track, video, fill, thumb);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        e.stopPropagation();
        this.setVolume(e, track, video, fill, thumb);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    track.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    video.addEventListener('volumechange', () => {
      this.updateSlider(fill, thumb, video.volume);
    });

    // Cleanup on video removal
    this.setupCleanupObserver(video, () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    });

    return { container, track, fill, thumb };
  }

  onCleanup() {
    // Remove all volume slider containers
    const allSliders = document.querySelectorAll('.insta-volume-slider-container');
    allSliders.forEach(slider => {
      if (slider.parentNode) {
        slider.remove();
      }
    });

    // Set all videos to max volume (1.0) unless they're muted
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
      try {
        // Only set volume if video is not muted
        // If muted, keep it muted but set volume to max so when unmuted it's at full volume
        video.volume = 1.0;
      } catch (error) {
        // Ignore errors
      }
    });
  }
}
