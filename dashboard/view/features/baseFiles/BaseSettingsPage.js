/**
 * BaseSettingsPage - Base class for all feature settings pages
 * Provides common functionality for settings management, UI rendering, and notifications
 */
class BaseSettingsPage {
    constructor() {
        this.toastManager = new Toast('toast');
        this.storageService = storageService;
    }

    /**
     * Render the page header with title and subtitle
     */
    renderHeader(config) {
        try {
            const { title, subtitle, backUrl = '../../index.html' } = config;
            const headerContainer = document.getElementById('headerContainer');
            if (headerContainer) {
                headerContainer.innerHTML = UIComponents.header({
                    icon: null,
                    title,
                    subtitle,
                    buttons: null,
                    showBackButton: true,
                    backButtonUrl: backUrl
                });
            }
        } catch (error) {
            console.error('[InstaBits Settings] Error rendering header:', error);
        }
    }

    /**
     * Setup common event listeners (back button, etc.)
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
     * Notify content script of settings changes
     */
    async notifyContentScript(messageType, data) {
        try {
            const tabs = await chrome.tabs.query({ url: '*://*.instagram.com/*' });
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: messageType,
                    ...data
                }).catch(() => {});
            });
        } catch (error) {
            console.log('Could not notify content script:', error);
        }
    }

    /**
     * Load a single setting from storage
     */
    async loadSetting(key, defaultValue) {
        try {
            return await this.storageService.getUserPreference(key, defaultValue);
        } catch (error) {
            console.error(`Error loading setting ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Save a single setting to storage
     */
    async saveSetting(key, value) {
        try {
            await this.storageService.setUserPreference(key, value);
            return true;
        } catch (error) {
            console.error(`Error saving setting ${key}:`, error);
            return false;
        }
    }

    /**
     * Save multiple settings and notify content script
     */
    async saveAndNotify(settingsMap, messageType, successMessage = 'Settings saved successfully!') {
        try {
            // Save each setting
            for (const [key, value] of Object.entries(settingsMap)) {
                await this.storageService.setUserPreference(key, value);
            }

            this.showToast('Settings Saved', successMessage, 'success');

            // Notify content script if message type provided
            if (messageType) {
                await this.notifyContentScript(messageType, settingsMap);
            }

            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Error', 'Failed to save settings. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Render a toggle switch
     */
    renderToggle(elementId, initialValue, onChange) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Toggle element ${elementId} not found`);
            return;
        }

        element.checked = initialValue;
        element.addEventListener('change', async (e) => {
            await onChange(e.target.checked);
        });
    }

    /**
     * Render an option grid with selectable items
     */
    renderOptionGrid(containerId, options, selectedValue, onSelect) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Grid container ${containerId} not found`);
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        options.forEach(option => {
            const element = this.createOptionElement(option);

            // Set selected state
            if (option.value === selectedValue ||
                (Array.isArray(selectedValue) && selectedValue.includes(option.value))) {
                element.classList.add('selected');
            }

            // Add click handler
            element.addEventListener('click', () => onSelect(option.value, element));

            container.appendChild(element);
        });
    }

    /**
     * Create an option element for grid
     */
    createOptionElement(option) {
        const element = document.createElement('div');
        element.className = option.className || 'option';
        element.setAttribute('data-value', option.value);

        if (option.color) {
            element.style.backgroundColor = option.color;
        }

        if (option.label) {
            element.textContent = option.label;
        }

        if (option.icon) {
            element.innerHTML = option.icon;
        }

        if (option.attributes) {
            Object.entries(option.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        return element;
    }

    /**
     * Update selected state for option grid
     */
    updateGridSelection(containerId, value, multiSelect = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const options = container.querySelectorAll('.option, .speed-option, .color-option, .mode-option');

        options.forEach(option => {
            const optionValue = option.getAttribute('data-value');

            if (multiSelect) {
                // For multi-select (like playback speeds)
                if (Array.isArray(value) && value.includes(optionValue)) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            } else {
                // For single select
                if (optionValue === value) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            }
        });
    }

    /**
     * Get element by ID with error handling
     */
    getElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element ${elementId} not found`);
        }
        return element;
    }

    /**
     * Initialize the settings page
     * Override this method in child classes
     */
    async init() {
        throw new Error('init() method must be implemented by child class');
    }
}
