// Features Configuration Data
// Add or modify features here - no need to touch HTML

const FEATURES_DATA = [
    {
        id: 'playbackSpeed',
        name: 'Playback Speed',
        searchName: 'playback speed video speed control',
        icon: {
            name: 'speed',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)'
        },
        badge: null,
        description: 'Control video playback speed from 0.25x to 3x for reels and posts',
        configButton: null,
        disabled: false,
        toggleable: true
    },
    {
        id: 'volumeSlider',
        name: 'Volume Control',
        searchName: 'volume control audio slider',
        icon: {
            name: 'volume',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #10b981, #059669)'
        },
        badge: null,
        description: 'Visual volume slider with persistent settings across videos',
        configButton: null,
        disabled: false,
        toggleable: true
    },
    {
        id: 'videoSeekbar',
        name: 'Video Seekbar',
        searchName: 'seekbar progress bar scrubber',
        icon: {
            name: 'seekbar',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        badge: null,
        description: 'Interactive progress bar to navigate through videos easily',
        configButton: null,
        disabled: false,
        toggleable: true
    },
    {
        id: 'videoDuration',
        name: 'Video Duration',
        searchName: 'duration time timestamp',
        icon: {
            name: 'duration',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        badge: null,
        description: 'Display current time and total duration overlay on videos',
        configButton: null,
        disabled: false,
        toggleable: true
    },
    {
        id: 'backgroundPlay',
        name: 'Background Play',
        searchName: 'background play tab hidden',
        icon: {
            name: 'play',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        badge: null,
        description: 'Keep videos playing when switching tabs or minimizing browser',
        configButton: null,
        disabled: false,
        toggleable: true
    },
    {
        id: 'autoScroll',
        name: 'Auto Scroll',
        searchName: 'auto scroll automatic reels',
        icon: {
            name: 'scroll',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)'
        },
        badge: null,
        description: 'Automatically scroll to the next reel when current video ends',
        configButton: null,
        disabled: false,
        toggleable: true
    }
];

// Helper function to get feature by ID
function getFeatureById(id) {
    return FEATURES_DATA.find(feature => feature.id === id);
}

// Helper function to get all enabled features
function getEnabledFeatures() {
    return FEATURES_DATA.filter(feature => !feature.disabled);
}

// Helper function to get disabled features
function getDisabledFeatures() {
    return FEATURES_DATA.filter(feature => feature.disabled);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FEATURES_DATA, getFeatureById, getEnabledFeatures, getDisabledFeatures };
}
