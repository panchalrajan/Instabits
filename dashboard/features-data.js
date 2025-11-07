// Features Configuration Data
// Add or modify features here - no need to touch HTML

const FEATURES_DATA = [
    {
        id: 'mediaDownloader',
        name: 'Media Downloader',
        searchName: 'media downloader',
        icon: 'download', // Simple format - uses default gradient
        badge: {
            text: 'NEW',
            color: BADGE_COLORS.green
        },
        description: 'Download photos and videos directly from posts and stories',
        configButton: { text: 'Configure', page: 'media-downloader', icon: 'arrow' },
        disabled: false,
        toggleable: true
    },
    {
        id: 'storyViewer',
        name: 'Story Viewer',
        searchName: 'story viewer',
        icon: {
            name: 'story',
            color: '#ffffff',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)' // Custom orange gradient
        },
        badge: {
            text: 'BETA',
            color: BADGE_COLORS.orange
        },
        description: 'View stories anonymously without sending read receipts',
        configButton: { text: 'Settings', page: 'story-viewer' }, // Custom button text
        disabled: false,
        toggleable: true
    },
    {
        id: 'autoScroll',
        name: 'Auto Scroll',
        searchName: 'auto scroll',
        icon: {
            name: 'scroll',
            color: '#ffffff',
            background: '#3b82f6' // Solid blue background
        },
        badge: null,
        description: 'Automatically scroll through your feed at customizable speeds',
        configButton: null, // Hide configure button completely
        disabled: false,
        toggleable: true
    },
    {
        id: 'profileInsights',
        name: 'Profile Insights',
        searchName: 'profile insights',
        icon: 'profile',
        badge: {
            text: 'NEW',
            color: BADGE_COLORS.green
        },
        description: 'View detailed analytics and insights for any profile',
        configButton: { text: 'View Details', page: 'profile-insights' },
        disabled: false,
        toggleable: false
    },
    {
        id: 'dmEnhancements',
        name: 'DM Enhancements',
        searchName: 'dm enhancements',
        icon: 'message',
        badge: {
            text: 'BETA',
            color: BADGE_COLORS.orange
        },
        description: 'Advanced messaging features with read receipt controls',
        configButton: { text: 'Configure', page: 'dm-enhancements' },
        disabled: false,
        toggleable: true
    },
    {
        id: 'postScheduler',
        name: 'Post Scheduler',
        searchName: 'post scheduler',
        icon: 'clock',
        badge: {
            text: 'COMING SOON',
            color: BADGE_COLORS.purple
        },
        description: 'Schedule posts for optimal engagement times',
        configButton: { text: 'Learn More', page: 'post-scheduler' },
        disabled: true,
        toggleable: false
    },
    {
        id: 'bulkActions',
        name: 'Bulk Actions',
        searchName: 'bulk actions',
        icon: 'grid',
        badge: null,
        description: 'Perform actions on multiple posts at once',
        configButton: { text: 'Configure', page: 'bulk-actions' },
        disabled: false,
        toggleable: true
    },
    {
        id: 'enhancedInteractions',
        name: 'Enhanced Interactions',
        searchName: 'enhanced interactions',
        icon: 'star',
        badge: {
            text: 'DEPRECATED',
            color: BADGE_COLORS.gray
        },
        description: 'Custom animations and interaction effects (deprecated)',
        configButton: null,
        disabled: true,
        toggleable: false
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
