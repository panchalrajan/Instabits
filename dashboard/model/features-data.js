// Features Configuration Data
// Add or modify features here - no need to touch HTML

// Section definitions - add new sections here
const SECTIONS = [
    { id: 'video', name: 'Video' },
    { id: 'automation', name: 'Automation' },
    { id: 'distraction', name: 'Distraction' }
];

const FEATURES_DATA = [
    {
        id: 'playbackSpeed',
        name: 'Playback Speed',
        section: 'video',
        searchName: 'playback speed video speed control',
        icon: {
            name: 'speed',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Control video playback speed from 0.25x to 3x for reels and posts',
        configButton: null,
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'volumeSlider',
        name: 'Volume Control',
        section: 'video',
        searchName: 'volume control audio slider',
        icon: {
            name: 'volume',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #10b981, #059669)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Visual volume slider with persistent settings across videos',
        configButton: null,
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'videoSeekbar',
        section: 'video',
        name: 'Video Seekbar',
        searchName: 'seekbar progress bar scrubber',
        icon: {
            name: 'seekbar',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Interactive progress bar to navigate through videos easily',
        configButton: {
            text: 'Configure',
            page: 'seekbarSettings',
            icon: 'arrow'
        },
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'videoDuration',
        section: 'video',
        name: 'Video Duration',
        searchName: 'duration time timestamp',
        icon: {
            name: 'duration',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Display current time and total duration overlay on videos',
        configButton: null,
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'pipMode',
        section: 'video',
        name: 'PIP Mode',
        searchName: 'pip picture in picture floating video',
        icon: {
            name: 'pip',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #ec4899, #db2777)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Watch reels in picture-in-picture mode with auto video switching',
        configButton: null,
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'backgroundPlay',
        section: 'video',
        name: 'Background Play',
        searchName: 'background play tab hidden',
        icon: {
            name: 'play',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Keep videos playing when switching tabs or minimizing browser',
        configButton: null,
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'autoScroll',
        section: 'automation',
        name: 'Auto Scroll',
        searchName: 'auto scroll automatic reels',
        icon: {
            name: 'scroll',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Automatically scroll to the next reel when current video ends',
        configButton: null,
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'zenMode',
        section: 'video',
        name: 'Zen Mode',
        searchName: 'zen mode distraction free clean minimal overlay hide',
        icon: {
            name: 'zen',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #a855f7, #9333ea)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Hide video overlays for distraction-free viewing. Overlays appear on hover.',
        configButton: null,
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'fullScreen',
        section: 'video',
        name: 'Full Screen',
        searchName: 'fullscreen full screen expand maximize theater',
        icon: {
            name: 'fullscreen',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f97316, #ea580c)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Add fullscreen button next to video duration for quick fullscreen access',
        configButton: null,
        disabled: false,
        toggleable: true,
        defaultEnabled: true
    },
    {
        id: 'hideReels',
        section: 'distraction',
        name: 'Hide Reels',
        searchName: 'hide reels distraction remove block',
        icon: {
            name: 'hideReels',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Hide Reels navigation link and Reels screen for distraction-free browsing',
        configButton: null,
        disabled: true,
        toggleable: true,
        defaultEnabled: false
    },
    {
        id: 'hideExplore',
        section: 'distraction',
        name: 'Hide Explore',
        searchName: 'hide explore distraction remove block',
        icon: {
            name: 'hideExplore',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Hide Explore navigation link and Explore screen to reduce distractions',
        configButton: null,
        disabled: true,
        toggleable: true,
        defaultEnabled: false
    },
    {
        id: 'hideStories',
        section: 'distraction',
        name: 'Hide Stories',
        searchName: 'hide stories distraction remove block',
        icon: {
            name: 'hideStories',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Hide Stories feed on home page and Stories screen',
        configButton: null,
        disabled: true,
        toggleable: true,
        defaultEnabled: false
    },
    {
        id: 'hideSuggestedFollowers',
        section: 'distraction',
        name: 'Hide Suggested Followers',
        searchName: 'hide suggested followers recommendations distraction remove block',
        icon: {
            name: 'hideSuggestedFollowers',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Hide the "Suggested for you" section on home page',
        configButton: null,
        disabled: true,
        toggleable: true,
        defaultEnabled: false
    },
    {
        id: 'hideThreads',
        section: 'distraction',
        name: 'Hide Threads',
        searchName: 'hide threads distraction remove block',
        icon: {
            name: 'hideThreads',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #64748b, #475569)'
        },
        badge: { text: 'New', color: BADGE_COLORS.green },
        description: 'Hide Threads navigation link from Instagram',
        configButton: null,
        disabled: true,
        toggleable: true,
        defaultEnabled: false
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FEATURES_DATA };
}
