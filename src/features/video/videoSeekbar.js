class VideoSeekbar extends BaseFeature {
  constructor() {
    super();
    this.progressColor = '#0095f6'; // Default color
    this.styleElementId = 'instabits-seekbar-style';
    this.seekbarElements = []; // Track all seekbar elements for cleanup
    this.messageListener = null; // Store listener reference for cleanup
    this.initializeColor();
    this.setupMessageListener();
  }

  async initializeColor() {
    // Load saved color from storage
    const color = await storageService.getUserPreference('seekbarProgressColor', '#0095f6');
    this.progressColor = color;

    // Inject CSS variable
    this.injectColorStyles();
  }

  setupMessageListener() {
    // Prevent duplicate listener registration
    if (this.messageListener) {
      return;
    }

    // Store listener reference for cleanup
    this.messageListener = (message, sender, sendResponse) => {
      try {
        if (message.type === 'updateSeekbarColor') {
          this.progressColor = message.seekbarProgressColor;
          this.injectColorStyles();
        }
      } catch (error) {
        console.error('Error in videoSeekbar message listener:', error);
      }
    };

    chrome.runtime.onMessage.addListener(this.messageListener);
  }

  /**
   * Inject CSS variable for seekbar color
   * This approach keeps styling in CSS and makes color changes more performant
   */
  injectColorStyles() {
    let styleElement = document.getElementById(this.styleElementId);

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = this.styleElementId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `:root { --instabits-seekbar-color: ${this.progressColor}; }`;
  }

  createSeekbar() {
    const seekbarContainer = this.createContainer('insta-video-seekbar-container');

    const progressBar = document.createElement('div');
    progressBar.className = 'insta-video-seekbar-progress';
    // Color is now applied via CSS variable --instabits-seekbar-color

    const hoverArea = document.createElement('div');
    hoverArea.className = 'insta-video-seekbar-hover';

    seekbarContainer.appendChild(progressBar);
    seekbarContainer.appendChild(hoverArea);

    return { seekbarContainer, progressBar, hoverArea };
  }

  seekToPosition(event, seekbarContainer, video) {
    const rect = seekbarContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * video.duration;

    if (newTime >= 0 && newTime <= video.duration) {
      video.currentTime = newTime;
    }
  }

  processVideo(video) {
    if (!video || this.isVideoTracked(video)) {
      return null;
    }

    const videoParent = this.getVideoParent(video);
    if (!videoParent) return null;

    this.ensureParentPositioned(videoParent);

    const { seekbarContainer, progressBar, hoverArea } = this.createSeekbar();

    videoParent.appendChild(seekbarContainer);

    // Track seekbar element for cleanup
    this.seekbarElements.push(seekbarContainer);

    let animationFrameId = null;
    const smoothUpdate = () => {
      if (video.duration > 0) {
        const percentage = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percentage}%`;
      }
      animationFrameId = requestAnimationFrame(smoothUpdate);
    };

    smoothUpdate();

    this.addToTrackedVideos(video, { seekbarContainer, progressBar, animationFrameId });

    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.seekToPosition(e, seekbarContainer, video);
    };

    hoverArea.addEventListener('click', handleClick);

    let isDragging = false;

    const handleMouseDown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      isDragging = true;
      this.seekToPosition(e, seekbarContainer, video);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        e.stopPropagation();
        e.preventDefault();
        this.seekToPosition(e, seekbarContainer, video);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    hoverArea.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup on video removal
    this.setupCleanupObserver(video, () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    });

    return { seekbarContainer, progressBar };
  }

  /**
   * Override onCleanup to remove all seekbar elements when feature is disabled
   */
  onCleanup() {
    // Remove all seekbar elements from DOM
    this.seekbarElements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Clear the array
    this.seekbarElements = [];

    // Remove style element
    const styleElement = document.getElementById(this.styleElementId);
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }

    // Remove message listener to prevent memory leaks
    if (this.messageListener) {
      chrome.runtime.onMessage.removeListener(this.messageListener);
      this.messageListener = null;
    }
  }
}
