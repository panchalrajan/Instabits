// Features Configuration Data
// Add or modify features here - no need to touch HTML

// Section definitions - add new sections here
const SECTIONS = [
    { id: 'video', name: 'Video' },
    { id: 'automation', name: 'Automation' },
    { id: 'distraction', name: 'Distractions' }
];

const FEATURES_DATA = [
    {
        id: 'playbackSpeed',
        name: 'Playback Speed',
        section: 'video',
        keywords: ['playback', 'speed', 'video', 'control', 'rate', 'slow', 'fast'],
        icon: {
            name: 'speed',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Control video playback speed from 0.25x to 3x for reels and posts',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: true,
            text: 'Configure',
            page: 'playbackSpeedSettings',
            icon: 'arrow'
        }
    },
    {
        id: 'volumeSlider',
        name: 'Volume Control',
        section: 'video',
        keywords: ['volume', 'control', 'audio', 'slider', 'mute', 'unmute', 'sound'],
        icon: {
            name: 'volume',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #10b981, #059669)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Custom volume slider with auto-sync mute, independent volume & mute states',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: false
        }
    },
    {
        id: 'videoSeekbar',
        section: 'video',
        name: 'Video Seekbar',
        keywords: ['seekbar', 'progress', 'bar', 'scrubber', 'timeline', 'navigation'],
        icon: {
            name: 'seekbar',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Interactive progress bar to navigate through videos easily',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: true,
            text: 'Configure',
            page: 'seekbarSettings',
            icon: 'arrow'
        }
    },
    {
        id: 'videoDuration',
        section: 'video',
        name: 'Video Duration',
        keywords: ['duration', 'time', 'timestamp', 'length', 'elapsed'],
        icon: {
            name: 'duration',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Display current time and total duration overlay on videos',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: false
        }
    },
    {
        id: 'pipMode',
        section: 'video',
        name: 'PIP Mode',
        keywords: ['pip', 'picture', 'in', 'picture', 'floating', 'video', 'multitask'],
        icon: {
            name: 'pip',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #ec4899, #db2777)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Watch reels in picture-in-picture mode with auto video switching',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: true,
            text: 'Info',
            page: 'pipModeSettings',
            icon: 'arrow'
        }
    },
    {
        id: 'backgroundPlay',
        section: 'video',
        name: 'Background Play',
        keywords: ['background', 'play', 'tab', 'hidden', 'minimize', 'continue'],
        icon: {
            name: 'play',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        badges: [
            { text: 'Experimental', color: BADGE_COLORS.orange }
        ],
        description: 'Keep videos playing when switching tabs or minimizing browser',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: false
        }
    },
    {
        id: 'autoScroll',
        section: 'automation',
        name: 'Auto Scroll: Reels',
        keywords: ['auto', 'scroll', 'reels', 'automatic', 'next', 'advance'],
        icon: {
            name: 'scroll',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)'
        },
        badges: [
            { text: 'Beta', color: BADGE_COLORS.pink }
        ],
        description: 'Automatically scroll to the next reel when current video ends',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: false
        }
    },
    {
        id: 'zenMode',
        section: 'video',
        name: 'Zen Mode',
        keywords: ['zen', 'mode', 'distraction', 'free', 'clean', 'minimal', 'overlay', 'hide'],
        icon: {
            name: 'zen',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #a855f7, #9333ea)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Hide video overlays for distraction-free viewing. Overlays appear on hover.',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: false
        }
    },
    {
        id: 'fullScreen',
        section: 'video',
        name: 'Full Screen',
        keywords: ['fullscreen', 'full', 'screen', 'expand', 'maximize', 'theater'],
        icon: {
            name: 'fullscreen',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f97316, #ea580c)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Add fullscreen button next to video duration for quick fullscreen access',
        control: {
            showToggle: true,
            defaultState: true,
            disabled: false
        },
        configPage: {
            show: false
        }
    },
    {
        id: 'disableDoubleTapLike',
        section: 'distraction',
        name: 'Disable Double Tap to Like',
        keywords: ['disable', 'double', 'tap', 'like', 'prevent', 'heart', 'animation', 'distraction', 'accidental'],
        icon: {
            name: 'heart',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Prevent accidental likes by disabling the double-tap to like gesture on posts',
        control: {
            showToggle: true,
            defaultState: false,
            disabled: false
        },
        configPage: {
            show: false
        }
    },
    {
        id: 'hideSuggestedFollowers',
        section: 'distraction',
        name: 'Hide Suggested Followers',
        keywords: ['hide', 'suggested', 'followers', 'suggestions', 'recommendations', 'clean', 'minimal'],
        icon: {
            name: 'user-x',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Hide the "Suggested for you" section on Instagram home page for distraction-free browsing',
        control: {
            showToggle: true,
            defaultState: false,
            disabled: false
        },
        configPage: {
            show: false
        }
    },
    {
        id: 'hideDirectMessage',
        section: 'distraction',
        name: 'Hide Direct Message',
        keywords: ['hide', 'direct', 'message', 'dm', 'inbox', 'chat', 'distraction', 'floating', 'button'],
        icon: {
            name: 'message-circle-off',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Hide Direct Message links and configure inbox access, floating button, and profile messaging',
        control: {
            showToggle: true,
            defaultState: false,
            disabled: false
        },
        configPage: {
            show: true,
            text: 'Configure',
            page: 'hideDirectMessageSettings',
            icon: 'arrow'
        }
    },
    {
        id: 'hideReels',
        section: 'distraction',
        name: 'Hide Reels',
        keywords: ['hide', 'reels', 'shorts', 'video', 'distraction', 'profile', 'tab'],
        icon: {
            name: 'film-off',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f97316, #ea580c)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Hide Reels navigation links and configure reels page access and profile reel tab',
        control: {
            showToggle: true,
            defaultState: false,
            disabled: false
        },
        configPage: {
            show: true,
            text: 'Configure',
            page: 'hideReelsSettings',
            icon: 'arrow'
        }
    },
    {
        id: 'grayscaleMode',
        section: 'distraction',
        name: 'Grayscale Mode',
        keywords: ['grayscale', 'gray', 'black', 'white', 'monochrome', 'color', 'filter', 'visual', 'distraction', 'focus'],
        icon: {
            name: 'filter',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #64748b, #475569)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Convert all media to grayscale for reduced visual distraction and mindful browsing',
        control: {
            showToggle: true,
            defaultState: false,
            disabled: false
        },
        configPage: {
            show: true,
            text: 'Info',
            page: 'grayscaleModeSettings',
            icon: 'arrow'
        }
    },
    {
        id: 'hideStories',
        section: 'distraction',
        name: 'Hide Stories',
        keywords: ['hide', 'stories', 'story', 'tray', 'distraction', 'circle', 'feed'],
        icon: {
            name: 'stories',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)'
        },
        badges: [
            { text: 'New', color: BADGE_COLORS.green }
        ],
        description: 'Hide Stories tray from homepage and configure stories page access',
        control: {
            showToggle: true,
            defaultState: false,
            disabled: false
        },
        configPage: {
            show: true,
            text: 'Configure',
            page: 'hideStoriesSettings',
            icon: 'arrow'
        }
    },
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FEATURES_DATA };
}
