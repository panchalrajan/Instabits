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
            </svg>`,
            // Feature icons
            volume: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            seekbar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="10" width="20" height="4" rx="2" stroke-width="2"/>
                <circle cx="6" cy="12" r="2" fill="currentColor"/>
            </svg>`,
            speed: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="3" stroke-width="2"/>
            </svg>`,
            duration: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 2h2v4M8 2H6v4" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            play: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>`,
            pip: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke-width="2"/>
                <rect x="12" y="10" width="8" height="5" rx="1" fill="currentColor"/>
            </svg>`,
            zen: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path d="M8 15c1.5 1 3.5 1 4 1s2.5 0 4-1" stroke-width="2" stroke-linecap="round"/>
                <circle cx="9" cy="9" r="1" fill="currentColor"/>
                <circle cx="15" cy="9" r="1" fill="currentColor"/>
            </svg>`,
            fullscreen: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            hideReels: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke-width="2"/>
                <path d="M2 6l6 6M8 6l-6 6M16 6l6 6M22 6l-6 6" stroke-width="2" stroke-linecap="round"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            hideExplore: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path d="M8 14l2-6 6-2-2 6-6 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            hideStories: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke-width="2"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            hideSuggestedFollowers: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            hideThreads: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 10h8M8 14h4" stroke-width="2" stroke-linecap="round"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
            </svg>`
        };

        return icons[iconName] || '';
    }

    /**
     * Create a square icon with customizable colors
     * @param {Object|string} iconConfig - Icon configuration object or icon name string
     * @returns {string} HTML string
     */
    static squareIcon(iconConfig) {
        // Support both simple string and object format
        const config = typeof iconConfig === 'string'
            ? { name: iconConfig, color: 'white', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }
            : {
                name: iconConfig.name,
                color: iconConfig.color || 'white',
                background: iconConfig.background || 'linear-gradient(135deg, var(--primary), var(--primary-hover))'
            };

        return `
            <div class="feature-icon" style="background: ${config.background}; color: ${config.color};">
                ${this.icon(config.name)}
            </div>
        `;
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
            configButton = null,
            disabled = false,
            toggleable = true
        } = feature;

        // Badge HTML
        const badgeHtml = badge ? this.badge(badge.text, badge.color) : '';

        // Toggle HTML - only show if toggleable is true
        const toggleHtml = toggleable ? `
            <label class="toggle">
                <input type="checkbox" data-feature="${id}">
                <span class="toggle-slider"></span>
            </label>
        ` : '';

        // Configure button
        let configButtonHtml = '';
        if (configButton) {
            const buttonText = configButton.text || 'Configure';
            const buttonPage = configButton.page;
            const buttonIcon = configButton.icon || 'arrow';
            const disabledClass = disabled ? 'disabled' : '';

            configButtonHtml = `
                <a href="#" class="feature-link ${disabledClass}" data-page="${buttonPage}">
                    ${buttonText}
                    ${this.icon(buttonIcon)}
                </a>
            `;
        }

        // Icon HTML using squareIcon
        const iconHtml = this.squareIcon(icon);

        return `
            <div class="feature-card" data-feature-name="${searchName || name.toLowerCase()}">
                ${iconHtml}
                <div class="feature-content">
                    <div class="feature-header">
                        <h3>${name}</h3>
                        ${toggleHtml}
                    </div>
                    <p class="feature-description">${description}</p>
                    <div class="feature-footer">
                        <div class="feature-footer-left">
                            ${badgeHtml}
                        </div>
                        ${configButtonHtml}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create a header component
     * @param {Object} options - Header configuration
     * @returns {string} HTML string
     */
    static header(options = {}) {
        const {
            icon = '../../icons/icon_128.png',
            title = 'InstaBits',
            subtitle = 'Manage your Instagram features',
            buttons = [
                { id: 'favorites', icon: 'favorites', title: 'Favorites' },
                { id: 'feedback', icon: 'feedback', title: 'Feedback' },
                { id: 'settings', icon: 'settings', title: 'Settings' }
            ],
            showBackButton = false,
            backButtonUrl = '../index.html'
        } = options;

        const backButtonHtml = showBackButton ? `
            <button class="icon-btn back-btn" id="backBtn" title="Back to Dashboard">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
        ` : '';

        const buttonsHtml = buttons ? buttons.map(btn => `
            <button class="icon-btn" title="${btn.title}" data-action="${btn.id}">
                ${this.icon(btn.icon)}
            </button>
        `).join('') : '';

        return `
            <header class="header">
                <div class="header-left">
                    ${backButtonHtml}
                    ${icon ? `<img src="${icon}" alt="${title}" class="app-icon">` : ''}
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
     * Create a search input component with filter button
     * @param {string} placeholder - Placeholder text
     * @param {Array} labels - Array of unique label objects for filter dropdown
     * @returns {string} HTML string
     */
    static searchBar(placeholder = 'Search features...', labels = []) {
        return `
            <div class="search-filter-wrapper">
                <div class="search-container">
                    <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <circle cx="8.5" cy="8.5" r="5.5" stroke-width="1.5"/>
                        <path d="M12.5 12.5L17 17" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <input type="text" id="searchInput" class="search-input" placeholder="${placeholder}">
                </div>
                <button class="filter-btn" id="filterBtn" title="Filter by labels">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M2 4h16M5 10h10M8 16h4" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <span class="filter-text">Filter</span>
                    <span class="filter-count" id="filterCount" style="display: none;"></span>
                </button>
                ${this.filterDropdown(labels)}
            </div>
        `;
    }

    /**
     * Create a filter dropdown component
     * @param {Array} labels - Array of unique label objects with text and color
     * @returns {string} HTML string
     */
    static filterDropdown(labels = []) {
        const labelCheckboxes = labels.map(label => `
            <label class="filter-option">
                <input type="checkbox" class="filter-checkbox" data-label="${label.text}">
                <span class="filter-option-content">
                    ${this.badge(label.text, label.color)}
                    <span class="filter-option-count" data-label-count="${label.text}">0</span>
                </span>
            </label>
        `).join('');

        return `
            <div class="filter-dropdown" id="filterDropdown" style="display: none;">
                <div class="filter-dropdown-header">
                    <h4>Filter by Labels</h4>
                    <button class="filter-clear" id="filterClear">Clear All</button>
                </div>
                <div class="filter-dropdown-content">
                    ${labelCheckboxes.length > 0 ? labelCheckboxes : '<p class="filter-empty">No labels available</p>'}
                </div>
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
