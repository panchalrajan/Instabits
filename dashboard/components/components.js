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
        // Use the centralized IconLibrary
        return IconLibrary.get(iconName);
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
                ${this.icon('arrow-left')}
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
