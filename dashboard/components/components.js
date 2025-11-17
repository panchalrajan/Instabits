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
            keywords = [],
            icon,
            badges = [],
            description,
            configPage = { show: false },
            control = { showToggle: true, disabled: false }
        } = feature;

        // Badges HTML - support multiple badges
        const badgesHtml = badges.map(badge =>
            this.badge(badge.text, badge.color)
        ).join('');

        // Toggle HTML - only show if control.showToggle is true
        const toggleHtml = control.showToggle ? `
            <label class="toggle">
                <input type="checkbox" data-feature="${id}">
                <span class="toggle-slider"></span>
            </label>
        ` : '';

        // Configure button
        let configButtonHtml = '';
        if (configPage && configPage.show) {
            const buttonText = configPage.text || 'Configure';
            const buttonPage = configPage.page;
            const buttonIcon = configPage.icon || 'arrow';
            const disabledClass = control.disabled ? 'disabled' : '';

            configButtonHtml = `
                <a href="#" class="feature-link ${disabledClass}" data-page="${buttonPage}">
                    ${buttonText}
                    ${this.icon(buttonIcon)}
                </a>
            `;
        }

        // Icon HTML using squareIcon
        const iconHtml = this.squareIcon(icon);

        // Build searchable string from keywords
        const searchString = keywords.join(' ');

        return `
            <div class="feature-card" data-feature-name="${searchString}">
                ${iconHtml}
                <div class="feature-content">
                    <div class="feature-header">
                        <h3>${name}</h3>
                        ${toggleHtml}
                    </div>
                    <p class="feature-description">${description}</p>
                    <div class="feature-footer">
                        <div class="feature-footer-left">
                            ${badgesHtml}
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
                { id: 'panic', icon: 'panic', title: 'Panic Mode - Temporarily disable extension' },
                { id: 'favorites', icon: 'star-rating', title: 'Rate Extension' },
                { id: 'feedback', icon: 'feedback', title: 'Feedback' },
                { id: 'settings', icon: 'settings', title: 'Settings' }
            ],
            showBackButton = false,
            backButtonUrl = '../index.html'
        } = options;

        const backButtonHtml = showBackButton ? `
            <button class="icon-btn back-btn" id="backBtn" data-tooltip="Back to Dashboard" data-tooltip-position="bottom">
                ${this.icon('arrow-left')}
            </button>
        ` : '';

        const buttonsHtml = buttons ? buttons.map(btn => `
            <button class="icon-btn" data-tooltip="${btn.title}" data-tooltip-position="bottom" data-action="${btn.id}">
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
                    <div class="search-icon">${IconLibrary.get('search')}</div>
                    <input type="text" id="searchInput" class="search-input" placeholder="${placeholder}">
                </div>
                <button class="filter-btn" id="filterBtn" title="Filter by labels">
                    ${IconLibrary.get('filter')}
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
                ${IconLibrary.get('no-results')}
                <h3>No features found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
    }

    // ========== SETTINGS PAGE COMPONENTS ==========

    static settingsSection(config) {
        const { title, description, content, className = '' } = config;
        return `
            <div class="settings-section ${className}">
                ${title ? `<h2 class="settings-section-title">${title}</h2>` : ''}
                ${description ? `<p class="settings-section-description">${description}</p>` : ''}
                ${content || ''}
            </div>
        `;
    }

    static infoBox(config) {
        const { title, items, icon = 'info' } = config;
        const iconSvg = this.icon(icon);
        const itemsHtml = items.map(item => `<li>${item}</li>`).join('');

        return `
            <div class="info-box">
                <div class="info-icon">${iconSvg}</div>
                <div class="info-content">
                    <h3 class="info-title">${title}</h3>
                    <ul class="info-list">${itemsHtml}</ul>
                </div>
            </div>
        `;
    }

    static statusItem(config) {
        const { featureId, name, description, icon, isEnabled } = config;
        const statusClass = isEnabled ? 'status-enabled' : 'status-disabled';
        const badgeClass = isEnabled ? 'badge-enabled' : 'badge-disabled';
        const badgeText = isEnabled ? 'Enabled' : 'Disabled';
        const iconSvg = this.icon(icon);

        const buttonHtml = !isEnabled
            ? `<button class="status-toggle-btn" data-feature-id="${featureId}">Enable</button>`
            : '';

        return `
            <div class="status-item ${statusClass}" data-feature-id="${featureId}">
                <div class="status-indicator"></div>
                <div class="status-icon">${iconSvg}</div>
                <div class="status-content">
                    <div class="status-header">
                        <h4 class="status-name">${name}</h4>
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <p class="status-description">${description}</p>
                </div>
                ${buttonHtml}
            </div>
        `;
    }

    static tipItem(config) {
        const { title, text, icon = 'check' } = config;
        const iconSvg = this.icon(icon);

        return `
            <div class="tip-item">
                <div class="tip-icon">${iconSvg}</div>
                <div class="tip-content">
                    <h4 class="tip-title">${title}</h4>
                    <p class="tip-text">${text}</p>
                </div>
            </div>
        `;
    }

    static tipsSection(config) {
        const { title = 'Tips for Best Experience', description = 'Get the most out of this feature', tips = [] } = config;
        const tipsHtml = tips.map(tip => this.tipItem(tip)).join('');

        return this.settingsSection({
            title,
            description,
            content: `<div class="tips-list">${tipsHtml}</div>`
        });
    }

    static divider() {
        return '<div class="settings-divider"></div>';
    }

    /**
     * Feature State Manager
     */
    static FeatureStateManager = class {
        constructor(features) {
            this.features = features;
            this.states = new Map();
        }

        async load() {
            try {
                const defaultStates = {};
                this.features.forEach(featureId => {
                    defaultStates[featureId] = true;
                });

                const result = await storageService.getAllFeatureStates(this.features, defaultStates);

                this.features.forEach(featureId => {
                    const isEnabled = result[featureId] === true;
                    this.states.set(featureId, isEnabled);
                });

                return this.states;
            } catch (error) {
                console.error('[InstaBits Settings] Error loading feature states:', error);
                this.features.forEach(featureId => {
                    this.states.set(featureId, true);
                });
                return this.states;
            }
        }

        async toggle(featureId) {
            try {
                const currentState = this.states.get(featureId);
                const newState = !currentState;

                await storageService.setFeatureState(featureId, newState);

                this.states.set(featureId, newState);
                return newState;
            } catch (error) {
                console.error('[InstaBits Settings] Error toggling feature:', error);
                throw error;
            }
        }

        get(featureId) {
            return this.states.get(featureId);
        }

        getAll() {
            return this.states;
        }
    };
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
