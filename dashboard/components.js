// UI Components Library for InstaBits Dashboard

class UIComponents {
    /**
     * Create a badge component
     * @param {string} text - Badge text
     * @param {string} color - Badge color (hex, rgb, or CSS color name)
     * @returns {string} HTML string
     */
    static badge(text, color) {
        if (!text || !color) return '';

        // Parse color to get appropriate text color (light or dark)
        const textColor = this.getContrastColor(color);

        return `<span class="badge" style="background-color: ${color}; color: ${textColor};">${text}</span>`;
    }

    /**
     * Get contrasting text color for a given background color
     * @param {string} bgColor - Background color
     * @returns {string} Text color (white or black)
     */
    static getContrastColor(bgColor) {
        // Simple contrast logic - you can enhance this
        // For now, use a predefined map for common colors
        const lightBgColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];
        const darkBgColors = ['#94a3b8', '#6b7280'];

        if (lightBgColors.includes(bgColor.toLowerCase())) {
            return '#ffffff';
        } else if (darkBgColors.includes(bgColor.toLowerCase())) {
            return '#ffffff';
        }

        // Default to white for custom colors
        return '#ffffff';
    }

    /**
     * Create an icon SVG
     * @param {string} iconName - Icon identifier
     * @returns {string} SVG HTML string
     */
    static icon(iconName) {
        const icons = {
            download: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            story: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke-width="2"/>
            </svg>`,
            scroll: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12l7 7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            profile: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            message: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            clock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            grid: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            star: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            arrow: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                <path d="M6 12L10 8L6 4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            // Header icons
            favorites: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M10 2L12.163 7.654L18 8.5L14 12.654L14.854 18.5L10 15.5L5.146 18.5L6 12.654L2 8.5L7.837 7.654L10 2Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            feedback: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M3 3h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5l-3 3V4a1 1 0 0 1 1-1z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            settings: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16.5 12.5a1.5 1.5 0 0 0 .3 1.65l.05.05a1.82 1.82 0 0 1 0 2.57 1.82 1.82 0 0 1-2.57 0l-.05-.05a1.5 1.5 0 0 0-1.65-.3 1.5 1.5 0 0 0-.9 1.37v.14a1.82 1.82 0 0 1-3.64 0v-.07a1.5 1.5 0 0 0-.98-1.37 1.5 1.5 0 0 0-1.65.3l-.05.05a1.82 1.82 0 0 1-2.57 0 1.82 1.82 0 0 1 0-2.57l.05-.05a1.5 1.5 0 0 0 .3-1.65 1.5 1.5 0 0 0-1.37-.9h-.14a1.82 1.82 0 0 1 0-3.64h.07a1.5 1.5 0 0 0 1.37-.98 1.5 1.5 0 0 0-.3-1.65l-.05-.05a1.82 1.82 0 0 1 0-2.57 1.82 1.82 0 0 1 2.57 0l.05.05a1.5 1.5 0 0 0 1.65.3h.07a1.5 1.5 0 0 0 .9-1.37v-.14a1.82 1.82 0 0 1 3.64 0v.07a1.5 1.5 0 0 0 .9 1.37 1.5 1.5 0 0 0 1.65-.3l.05-.05a1.82 1.82 0 0 1 2.57 0 1.82 1.82 0 0 1 0 2.57l-.05.05a1.5 1.5 0 0 0-.3 1.65v.07a1.5 1.5 0 0 0 1.37.9h.14a1.82 1.82 0 0 1 0 3.64h-.07a1.5 1.5 0 0 0-1.37.98z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        };

        return icons[iconName] || '';
    }

    /**
     * Create a feature card component
     * @param {Object} feature - Feature configuration object
     * @returns {string} HTML string
     */
    static featureCard(feature) {
        const {
            id,
            name,
            searchName,
            icon,
            badge,
            description,
            configPage,
            disabled = false
        } = feature;

        const badgeHtml = badge ? this.badge(badge.text, badge.color) : '';
        const disabledAttr = disabled ? 'disabled' : '';
        const disabledClass = disabled ? 'disabled' : '';

        return `
            <div class="feature-card" data-feature-name="${searchName || name.toLowerCase()}">
                <div class="feature-icon">
                    ${this.icon(icon)}
                </div>
                <div class="feature-content">
                    <div class="feature-header">
                        <h3>${name}</h3>
                        <label class="toggle">
                            <input type="checkbox" data-feature="${id}" ${disabledAttr}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    ${badgeHtml}
                    <p class="feature-description">${description}</p>
                    <a href="#" class="feature-link ${disabledClass}" data-page="${configPage}">
                        Configure
                        ${this.icon('arrow')}
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Create a toast notification
     * @param {Object} options - Toast configuration
     * @returns {string} HTML string
     */
    static toast(options) {
        const { title, message, type = 'info' } = options;

        const icons = {
            success: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            warning: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M10 3L2 17h16L10 3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 8v4M10 14h.01" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            error: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <circle cx="10" cy="10" r="8" stroke-width="2"/>
                <path d="M12.5 7.5L7.5 12.5M7.5 7.5l5 5" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            info: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <circle cx="10" cy="10" r="8" stroke-width="2"/>
                <path d="M10 14V10M10 7h.01" stroke-width="2" stroke-linecap="round"/>
            </svg>`
        };

        return `
            <div class="toast-content">
                <div class="toast-icon">
                    ${icons[type]}
                </div>
                <div class="toast-details">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" onclick="window.dashboard.hideToast()">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor">
                        <path d="M12 4L4 12M4 4l8 8" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="toast-progress"></div>
        `;
    }

    /**
     * Create a header component
     * @param {Object} options - Header configuration
     * @returns {string} HTML string
     */
    static header(options = {}) {
        const {
            icon = '../icons/icon_128.png',
            title = 'InstaBits',
            subtitle = 'Manage your Instagram features',
            buttons = [
                { id: 'favorites', icon: 'favorites', title: 'Favorites' },
                { id: 'feedback', icon: 'feedback', title: 'Feedback' },
                { id: 'settings', icon: 'settings', title: 'Settings' }
            ]
        } = options;

        const buttonsHtml = buttons.map(btn => `
            <button class="icon-btn" title="${btn.title}" data-action="${btn.id}">
                ${this.icon(btn.icon)}
            </button>
        `).join('');

        return `
            <header class="header">
                <div class="header-left">
                    <img src="${icon}" alt="${title}" class="app-icon">
                    <div class="header-text">
                        <h1>${title}</h1>
                        <p>${subtitle}</p>
                    </div>
                </div>
                <div class="header-right">
                    ${buttonsHtml}
                </div>
            </header>
        `;
    }

    /**
     * Create a search input component
     * @param {string} placeholder - Placeholder text
     * @returns {string} HTML string
     */
    static searchBar(placeholder = 'Search features...') {
        return `
            <div class="search-container">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <circle cx="8.5" cy="8.5" r="5.5" stroke-width="1.5"/>
                    <path d="M12.5 12.5L17 17" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input type="text" id="searchInput" class="search-input" placeholder="${placeholder}">
            </div>
        `;
    }

    /**
     * Create a no results message
     * @returns {string} HTML string
     */
    static noResults() {
        return `
            <div id="noResults" class="no-results" style="display: none;">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
                    <circle cx="20" cy="20" r="10" stroke-width="2"/>
                    <path d="M28 28L40 40" stroke-width="2" stroke-linecap="round"/>
                    <path d="M20 15v10M20 30h.01" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <h3>No features found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
    }
}

// Predefined color tokens for common badge colors
const BADGE_COLORS = {
    green: '#10b981',
    blue: '#3b82f6',
    orange: '#f59e0b',
    purple: '#8b5cf6',
    gray: '#94a3b8',
    red: '#ef4444',
    cyan: '#06b6d4',
    pink: '#ec4899',
    yellow: '#eab308'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIComponents, BADGE_COLORS };
}
