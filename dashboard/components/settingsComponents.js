// Reusable Settings Components Library
// Common UI components for all feature settings pages

class SettingsComponents {
    /**
     * Base Settings Page Class
     * Provides common functionality for all settings pages
     */
    static BaseSettingsPage = class {
        constructor() {
            this.toastManager = new Toast('toast');
        }

        /**
         * Render header with back button (no icon for settings pages)
         * @param {Object} config - Header configuration
         */
        renderHeader(config) {
            const { title, subtitle, backUrl = '../../index.html' } = config;
            const headerContainer = document.getElementById('headerContainer');
            if (headerContainer) {
                headerContainer.innerHTML = UIComponents.header({
                    icon: null, // No icon for settings pages
                    title,
                    subtitle,
                    buttons: null,
                    showBackButton: true,
                    backButtonUrl: backUrl
                });
            }
        }

        /**
         * Setup common event listeners
         */
        setupCommonListeners() {
            const backBtn = document.getElementById('backBtn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    const backUrl = backBtn.getAttribute('data-back-url') || '../../index.html';
                    window.location.href = backUrl;
                });
            }
        }

        /**
         * Show toast notification
         */
        showToast(title, message, type = 'success') {
            this.toastManager.show(title, message, type);
        }

        /**
         * Notify content script about changes
         */
        async notifyContentScript(messageType, data) {
            try {
                const tabs = await chrome.tabs.query({ url: '*://*.instagram.com/*' });
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        type: messageType,
                        ...data
                    }).catch(() => {
                        // Tab might not have content script loaded, ignore error
                    });
                });
            } catch (error) {
                console.log('Could not notify content script:', error);
            }
        }
    };

    /**
     * Create settings section HTML
     * @param {Object} config - Section configuration
     * @returns {string} HTML string
     */
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

    /**
     * Create info box component
     * @param {Object} config - Info box configuration
     * @returns {string} HTML string
     */
    static infoBox(config) {
        const { title, items, icon = 'info' } = config;
        const iconSvg = this.getIcon(icon);
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

    /**
     * Create status item component
     * @param {Object} config - Status item configuration
     * @returns {string} HTML string
     */
    static statusItem(config) {
        const { featureId, name, description, icon, isEnabled } = config;
        const statusClass = isEnabled ? 'status-enabled' : 'status-disabled';
        const badgeClass = isEnabled ? 'badge-enabled' : 'badge-disabled';
        const badgeText = isEnabled ? 'Enabled' : 'Disabled';
        const iconSvg = this.getIcon(icon);

        // Only show button if feature is disabled
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

    /**
     * Create tip item component
     * @param {Object} config - Tip configuration
     * @returns {string} HTML string
     */
    static tipItem(config) {
        const { title, text, icon = 'check' } = config;
        const iconSvg = this.getIcon(icon);

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

    /**
     * Create a complete tips section with multiple tips
     * @param {Object} config - Tips section configuration
     * @returns {string} HTML string
     */
    static tipsSection(config) {
        const { title = 'Tips for Best Experience', description = 'Get the most out of this feature', tips = [] } = config;

        const tipsHtml = tips.map(tip => this.tipItem(tip)).join('');

        return this.settingsSection({
            title,
            description,
            content: `<div class="tips-list">${tipsHtml}</div>`
        });
    }

    /**
     * Create divider
     * @returns {string} HTML string
     */
    static divider() {
        return '<div class="settings-divider"></div>';
    }

    /**
     * Get icon SVG from IconLibrary
     * @param {string} iconName - Icon identifier
     * @returns {string} SVG HTML string
     */
    static getIcon(iconName) {
        // Always use IconLibrary - it should be loaded before this component
        if (typeof IconLibrary !== 'undefined' && IconLibrary.get) {
            return IconLibrary.get(iconName);
        }

        console.error(`IconLibrary not found or icon "${iconName}" not available`);
        return '';
    }

    /**
     * Feature State Manager
     * Helper class for managing feature states in settings pages
     */
    static FeatureStateManager = class {
        constructor(features) {
            this.features = features; // Array of feature IDs
            this.states = new Map();
        }

        async load() {
            const storageKeys = this.features.map(f => `instabits_feature_${f}`);
            const result = await chrome.storage.sync.get(storageKeys);

            this.features.forEach(featureId => {
                const storageKey = `instabits_feature_${featureId}`;
                const isEnabled = result[storageKey] === undefined ? true : result[storageKey] === true;
                this.states.set(featureId, isEnabled);
            });

            return this.states;
        }

        async toggle(featureId) {
            const currentState = this.states.get(featureId);
            const newState = !currentState;

            const storageKey = `instabits_feature_${featureId}`;
            await chrome.storage.sync.set({ [storageKey]: newState });

            this.states.set(featureId, newState);
            return newState;
        }

        get(featureId) {
            return this.states.get(featureId);
        }

        getAll() {
            return this.states;
        }
    };
}
