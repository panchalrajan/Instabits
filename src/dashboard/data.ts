/**
 * Feature data for dashboard
 */

import type { FeatureData, Section } from './types';

export const FEATURES_DATA: FeatureData[] = [
  // Video Features
  {
    id: 'playbackSpeed',
    name: 'Playback Speed',
    icon: { name: 'speed', background: 'linear-gradient(135deg, #667eea, #764ba2)' },
    badges: [{ text: 'New', color: '#10b981' }],
    description: 'Control video playback speed with customizable speed options.',
    category: 'video',
    configButton: { text: 'Configure', icon: 'arrow', page: 'speed-settings' },
  },
  {
    id: 'volumeSlider',
    name: 'Volume Control',
    icon: { name: 'volume', background: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    badges: [{ text: 'Beta', color: '#3b82f6' }],
    description: 'Custom volume slider with independent volume and mute states.',
    category: 'video',
  },
  {
    id: 'videoSeekbar',
    name: 'Video Seekbar',
    icon: { name: 'seekbar', background: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    description: 'Interactive progress bar for easy video navigation.',
    category: 'video',
  },
  {
    id: 'videoDuration',
    name: 'Video Duration',
    icon: { name: 'clock', background: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    description: 'Display current time and total duration overlay.',
    category: 'video',
  },
  {
    id: 'pipMode',
    name: 'Picture-in-Picture',
    icon: { name: 'pip', background: 'linear-gradient(135deg, #fa709a, #fee140)' },
    description: 'Watch videos in a floating window while browsing.',
    category: 'video',
  },
  {
    id: 'fullScreen',
    name: 'Fullscreen',
    icon: { name: 'fullscreen', background: 'linear-gradient(135deg, #30cfd0, #330867)' },
    description: 'Quick fullscreen button for immersive viewing.',
    category: 'video',
  },
  {
    id: 'backgroundPlay',
    name: 'Background Play',
    icon: { name: 'play', background: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
    badges: [{ text: 'Experimental', color: '#f59e0b' }],
    description: 'Keep videos playing when switching tabs.',
    category: 'video',
  },
  {
    id: 'zenMode',
    name: 'Zen Mode',
    icon: { name: 'zen', background: 'linear-gradient(135deg, #d299c2, #fef9d7)' },
    description: 'Hide overlays for distraction-free viewing.',
    category: 'video',
  },

  // Automation Features
  {
    id: 'autoScroll',
    name: 'Auto Scroll: Reels',
    icon: { name: 'scroll', background: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
    badges: [{ text: 'New', color: '#10b981' }],
    description: 'Automatically scroll to the next reel when video ends.',
    category: 'automation',
    configButton: { text: 'Configure', icon: 'arrow', page: 'autoscroll-settings' },
  },
];

export const SECTIONS: Section[] = [
  {
    id: 'video',
    name: 'Video Features',
    features: FEATURES_DATA.filter((f) => f.category === 'video').map((f) => f.id),
  },
  {
    id: 'automation',
    name: 'Automation',
    features: FEATURES_DATA.filter((f) => f.category === 'automation').map((f) => f.id),
  },
];
