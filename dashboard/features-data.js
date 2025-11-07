// Features Configuration Data
// Add or modify features here - no need to touch HTML

const FEATURES_DATA = [
    {
        id: 'mediaDownloader',
        name: 'Media Downloader',
        searchName: 'media downloader',
        icon: 'download',
        badge: {
            text: 'NEW',
            color: BADGE_COLORS.green  // or use hex directly: '#10b981'
        },
        description: 'Download photos and videos directly from posts and stories',
        configPage: 'media-downloader',
        disabled: false
    },
    {
        id: 'storyViewer',
        name: 'Story Viewer',
        searchName: 'story viewer',
        icon: 'story',
        badge: {
            text: 'BETA',
            color: BADGE_COLORS.orange  // or '#f59e0b'
        },
        description: 'View stories anonymously without sending read receipts',
        configPage: 'story-viewer',
        disabled: false
    },
    {
        id: 'autoScroll',
        name: 'Auto Scroll',
        searchName: 'auto scroll',
        icon: 'scroll',
        badge: null, // No badge for this feature
        description: 'Automatically scroll through your feed at customizable speeds',
        configPage: 'auto-scroll',
        disabled: false
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
        configPage: 'profile-insights',
        disabled: false
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
        configPage: 'dm-enhancements',
        disabled: false
    },
    {
        id: 'postScheduler',
        name: 'Post Scheduler',
        searchName: 'post scheduler',
        icon: 'clock',
        badge: {
            text: 'COMING SOON',
            color: BADGE_COLORS.purple  // or '#8b5cf6'
        },
        description: 'Schedule posts for optimal engagement times',
        configPage: 'post-scheduler',
        disabled: true // Feature is disabled (coming soon)
    },
    {
        id: 'bulkActions',
        name: 'Bulk Actions',
        searchName: 'bulk actions',
        icon: 'grid',
        badge: null, // No badge
        description: 'Perform actions on multiple posts at once',
        configPage: 'bulk-actions',
        disabled: false
    },
    {
        id: 'enhancedInteractions',
        name: 'Enhanced Interactions',
        searchName: 'enhanced interactions',
        icon: 'star',
        badge: {
            text: 'DEPRECATED',
            color: BADGE_COLORS.gray  // or '#94a3b8'
        },
        description: 'Custom animations and interaction effects (deprecated)',
        configPage: 'enhanced-interactions',
        disabled: true // Feature is disabled (deprecated)
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
