/**
 * IconLibrary - Centralized SVG icon collection for InstaBits Dashboard
 *
 * All icons are defined as SVG strings for easy reuse across the application.
 * Icons are organized by category for better maintainability.
 */
class IconLibrary {
    /**
     * Get an icon by name
     * @param {string} iconName - Icon identifier
     * @returns {string} SVG HTML string
     */
    static get(iconName) {
        const icon = this.icons[iconName];
        if (!icon) {
            console.warn(`Icon "${iconName}" not found in IconLibrary`);
            return '';
        }
        return icon;
    }

    /**
     * Check if an icon exists
     * @param {string} iconName - Icon identifier
     * @returns {boolean}
     */
    static has(iconName) {
        return !!this.icons[iconName];
    }

    /**
     * Get all available icon names
     * @returns {string[]} Array of icon names
     */
    static getAvailableIcons() {
        return Object.keys(this.icons);
    }
}

/**
 * Icon collection organized by category
 */
IconLibrary.icons = {
    // ========== TOAST ICONS ==========
    'toast-success': `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'toast-error': `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M10 6v4m0 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'toast-warning': `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M10 6v4m0 4h.01M10 2l8 14H2L10 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'toast-info': `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M10 11v5m0-10h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'toast-close': `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor">
        <path d="M12 4L4 12M4 4l8 8" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // ========== NAVIGATION ICONS ==========
    'arrow': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
        <path d="M6 12L10 8L6 4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'arrow-left': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>`,

    // ========== HEADER ACTION ICONS ==========
    'favorites': `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M10 2L12.163 7.654L18 8.5L14 12.654L14.854 18.5L10 15.5L5.146 18.5L6 12.654L2 8.5L7.837 7.654L10 2Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'feedback': `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M18 10a8 8 0 01-8 8H2V10a8 8 0 1116 0z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'settings': `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16.5 12.5a1.5 1.5 0 0 0 .3 1.65l.05.05a1.817 1.817 0 0 1 0 2.575 1.817 1.817 0 0 1-2.575 0l-.05-.05a1.5 1.5 0 0 0-1.65-.3 1.5 1.5 0 0 0-.9 1.375v.15a1.818 1.818 0 0 1-3.636 0v-.08a1.5 1.5 0 0 0-.975-1.375 1.5 1.5 0 0 0-1.65.3l-.05.05a1.817 1.817 0 0 1-2.575 0 1.817 1.817 0 0 1 0-2.575l.05-.05a1.5 1.5 0 0 0 .3-1.65 1.5 1.5 0 0 0-1.375-.9h-.15a1.818 1.818 0 0 1 0-3.636h.08a1.5 1.5 0 0 0 1.375-.975 1.5 1.5 0 0 0-.3-1.65l-.05-.05a1.817 1.817 0 0 1 0-2.575 1.817 1.817 0 0 1 2.575 0l.05.05a1.5 1.5 0 0 0 1.65.3h.075a1.5 1.5 0 0 0 .9-1.375v-.15a1.818 1.818 0 0 1 3.636 0v.08a1.5 1.5 0 0 0 .9 1.375 1.5 1.5 0 0 0 1.65-.3l.05-.05a1.817 1.817 0 0 1 2.575 0 1.817 1.817 0 0 1 0 2.575l-.05.05a1.5 1.5 0 0 0-.3 1.65v.075a1.5 1.5 0 0 0 1.375.9h.15a1.818 1.818 0 0 1 0 3.636h-.08a1.5 1.5 0 0 0-1.375.975z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    // ========== UTILITY ICONS ==========
    'download': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'upload': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'search': `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'filter': `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M18 2H2l6.5 7.681V16l3 2v-7.319L18 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'no-results': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
        <path d="M21 38a17 17 0 1 0 0-34 17 17 0 0 0 0 34zM44 44l-9.35-9.35M21 14v14M14 21h14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    // ========== FEATURE ICONS ==========
    'volume': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'seekbar': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke-width="2"/>
        <path d="M3 10h18M7 14h10" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    'speed': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke-width="2"/>
    </svg>`,

    'duration': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="2"/>
        <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'fullscreen': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    'pip': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke-width="2"/>
        <rect x="13" y="11" width="7" height="5" rx="1" fill="currentColor" opacity="0.5"/>
    </svg>`,

    'play': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="2"/>
        <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>
    </svg>`,

    'scroll': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 5v14M19 12l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 3h14" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    'zen': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke-width="2"/>
        <path d="M3 3L21 21" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    'hideReels': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke-width="2"/>
        <path d="M4 8h16M12 8v12" stroke-width="2"/>
        <path d="M3 3L21 21" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    'hideExplore': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="2"/>
        <path d="M16.24 7.76l-8.48 8.48M7.76 7.76l8.48 8.48" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    'hideStories': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="2"/>
        <circle cx="12" cy="12" r="6" stroke-width="2"/>
        <path d="M3 3L21 21" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    'hideSuggestedFollowers': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 3L21 21" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    'hideThreads': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 3L21 21" stroke-width="2" stroke-linecap="round"/>
    </svg>`
};
