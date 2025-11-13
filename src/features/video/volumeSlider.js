class VolumeSlider extends BaseFeature {
  constructor() {
    super();
  }

  initialize() {
    // Set default first
    this.savedVolume = 1.0;

    // Load saved volume asynchronously
    this.loadSavedVolume();
  }

  async loadSavedVolume() {
    const saved = await storageService.getUserPreference('volume', 1.0);
    this.savedVolume = saved;
  }

  async saveVolume(volume) {
    this.savedVolume = volume;
    await storageService.setUserPreference('volume', volume);
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

    // Apply saved volume to this video
    video.volume = this.savedVolume;

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
}
