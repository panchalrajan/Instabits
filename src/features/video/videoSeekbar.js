class VideoSeekbar extends BaseFeature {
  constructor() {
    super();
    this.progressColor = '#0095f6'; // Default color
    this.progressBars = []; // Track progress bars for color updates
    this.initializeColor();
    this.setupMessageListener();
  }

  async initializeColor() {
    // Load saved color from storage
    const color = await storageService.getUserPreference('seekbarProgressColor', '#0095f6');
    this.progressColor = color;

    // Update all existing progress bars
    this.updateAllProgressBars();
  }

  setupMessageListener() {
    // Listen for color updates from settings page
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'updateSeekbarColor') {
        this.progressColor = message.color;
        this.updateAllProgressBars();
      }
    });
  }

  updateAllProgressBars() {
    // Update all tracked progress bars with new color
    // Filter out any bars that have been removed from DOM
    this.progressBars = this.progressBars.filter(bar => {
      if (document.contains(bar)) {
        bar.style.background = this.progressColor;
        return true;
      }
      return false;
    });
  }

  createSeekbar() {
    const seekbarContainer = this.createContainer('insta-video-seekbar-container');

    const progressBar = document.createElement('div');
    progressBar.className = 'insta-video-seekbar-progress';
    progressBar.style.background = this.progressColor; // Apply saved color

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

    let animationFrameId = null;
    const smoothUpdate = () => {
      if (video.duration > 0) {
        const percentage = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percentage}%`;
      }
      animationFrameId = requestAnimationFrame(smoothUpdate);
    };

    smoothUpdate();

    // Track progress bar for color updates
    this.progressBars.push(progressBar);

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
}
