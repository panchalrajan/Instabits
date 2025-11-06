class VideoSeekbar {
  constructor() {
    this.trackedVideos = new WeakMap();
  }

  create() {
    const seekbarContainer = document.createElement('div');
    seekbarContainer.className = 'insta-video-seekbar-container';

    const progressBar = document.createElement('div');
    progressBar.className = 'insta-video-seekbar-progress';

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

  addOverlayToVideo(video) {
    if (!video || this.trackedVideos.has(video)) {
      return null;
    }

    const videoParent = video.parentElement;
    if (!videoParent) return null;

    const currentPosition = window.getComputedStyle(videoParent).position;
    if (currentPosition === 'static') {
      videoParent.style.position = 'relative';
    }

    const { seekbarContainer, progressBar, hoverArea } = this.create();

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

    this.trackedVideos.set(video, { seekbarContainer, progressBar, animationFrameId });

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

    const observer = new MutationObserver(() => {
      if (!document.contains(video)) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return { seekbarContainer, progressBar };
  }

  processAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      this.addOverlayToVideo(video);
    });
  }
}
