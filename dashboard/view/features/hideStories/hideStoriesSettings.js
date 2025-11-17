// Hide Stories Settings Page
class HideStoriesSettings extends BaseSettingsPage {
    constructor() {
        super();

        // Settings keys
        this.settingsKeys = {
            disableStoriesPage: 'instabits_hideStories_disableStoriesPage',
            hideProfileStories: 'instabits_hideStories_hideProfileStories'
        };

        // Current settings state
        this.settings = {
            disableStoriesPage: false,
            hideProfileStories: false
        };

        this.init();
    }

    async init() {
        // Render header
        this.renderHeader({
            title: 'Hide Stories Settings',
            subtitle: 'Configure how Stories are hidden'
        });

        // Inject info icon
        const infoIcon = document.getElementById('infoIcon');
        if (infoIcon) {
            infoIcon.innerHTML = IconLibrary.get('info');
        }

        // Load settings
        await this.loadSettings();

        // Setup event listeners
        this.setupCommonListeners();
        this.setupToggleListeners();
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            const storageKeys = Object.values(this.settingsKeys);
            const defaults = {
                'instabits_hideStories_disableStoriesPage': false,
                'instabits_hideStories_hideProfileStories': false
            };

            const result = await storageService.getMultiple(storageKeys, defaults);

            // Update settings with loaded values
            this.settings.disableStoriesPage = result[this.settingsKeys.disableStoriesPage] || false;
            this.settings.hideProfileStories = result[this.settingsKeys.hideProfileStories] || false;

            // Update UI toggles
            this.updateToggles();
        } catch (error) {
            console.error('[Hide Stories Settings] Error loading settings:', error);
            this.showToast('Error', 'Failed to load settings', 'error');
        }
    }

    /**
     * Update toggle states in UI
     */
    updateToggles() {
        document.getElementById('disableStoriesPage').checked = this.settings.disableStoriesPage;
        document.getElementById('hideProfileStories').checked = this.settings.hideProfileStories;
    }

    /**
     * Setup toggle event listeners
     */
    setupToggleListeners() {
        const toggles = document.querySelectorAll('[data-setting]');

        toggles.forEach(toggle => {
            toggle.addEventListener('change', async (e) => {
                const settingName = e.target.dataset.setting;
                const newValue = e.target.checked;

                await this.updateSetting(settingName, newValue);
            });
        });
    }

    /**
     * Update a single setting
     */
    async updateSetting(settingName, newValue) {
        try {
            // Update local state
            this.settings[settingName] = newValue;

            // Save to storage
            const storageKey = this.settingsKeys[settingName];
            await storageService.set(storageKey, newValue);

            // Show toast
            const settingLabels = {
                disableStoriesPage: 'Disable Stories Page',
                hideProfileStories: 'Hide all Profile Stories'
            };

            const title = newValue ? 'Setting Enabled' : 'Setting Disabled';
            const message = `${settingLabels[settingName]} has been ${newValue ? 'enabled' : 'disabled'}`;
            const type = newValue ? 'success' : 'warning';

            this.showToast(title, message, type);

        } catch (error) {
            console.error('[Hide Stories Settings] Error updating setting:', error);
            this.showToast('Error', 'Failed to save setting', 'error');
            // Revert toggle
            const toggle = document.querySelector(`[data-setting="${settingName}"]`);
            if (toggle) {
                toggle.checked = !newValue;
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HideStoriesSettings();
});
