// Hide Direct Message Settings Page
class HideDirectMessageSettings extends BaseSettingsPage {
    constructor() {
        super();

        // Settings keys
        this.settingsKeys = {
            disableInboxPage: 'instabits_hideDirectMessage_disableInboxPage',
            hideFloatingButton: 'instabits_hideDirectMessage_hideFloatingButton',
            disableMessageToProfile: 'instabits_hideDirectMessage_disableMessageToProfile'
        };

        // Current settings state
        this.settings = {
            disableInboxPage: false,
            hideFloatingButton: false,
            disableMessageToProfile: false
        };

        this.init();
    }

    async init() {
        // Render header
        this.renderHeader({
            title: 'Hide Direct Message Settings',
            subtitle: 'Configure how Direct Messages are hidden'
        });

        // Inject info icon
        const infoIcon = document.getElementById('infoIcon');
        if (infoIcon) {
            infoIcon.innerHTML = IconLibrary.get('info');
        }

        // Load settings
        await this.loadSettings();

        // Render UI
        this.renderUI();

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
                'instabits_hideDirectMessage_disableInboxPage': false,
                'instabits_hideDirectMessage_hideFloatingButton': false,
                'instabits_hideDirectMessage_disableMessageToProfile': false
            };

            const result = await storageService.getMultiple(storageKeys, defaults);

            // Update settings with loaded values
            this.settings.disableInboxPage = result[this.settingsKeys.disableInboxPage] || false;
            this.settings.hideFloatingButton = result[this.settingsKeys.hideFloatingButton] || false;
            this.settings.disableMessageToProfile = result[this.settingsKeys.disableMessageToProfile] || false;

            // Update UI toggles
            this.updateToggles();
        } catch (error) {
            console.error('[Hide DM Settings] Error loading settings:', error);
            this.showToast('Error', 'Failed to load settings', 'error');
        }
    }

    /**
     * Update toggle states in UI
     */
    updateToggles() {
        document.getElementById('disableInboxPage').checked = this.settings.disableInboxPage;
        document.getElementById('hideFloatingButton').checked = this.settings.hideFloatingButton;
        document.getElementById('disableMessageToProfile').checked = this.settings.disableMessageToProfile;
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
                disableInboxPage: 'Disable Inbox Page',
                hideFloatingButton: 'Hide Floating Button',
                disableMessageToProfile: 'Disable Message to Profile'
            };

            const title = newValue ? 'Setting Enabled' : 'Setting Disabled';
            const message = `${settingLabels[settingName]} has been ${newValue ? 'enabled' : 'disabled'}`;
            const type = newValue ? 'success' : 'warning';

            this.showToast(title, message, type);

        } catch (error) {
            console.error('[Hide DM Settings] Error updating setting:', error);
            this.showToast('Error', 'Failed to save setting', 'error');
            // Revert toggle
            const toggle = document.querySelector(`[data-setting="${settingName}"]`);
            if (toggle) {
                toggle.checked = !newValue;
            }
        }
    }

    renderUI() {
        this.renderTipsSection();
    }

    renderTipsSection() {
        const tipsContainer = document.getElementById('tipsContainer');
        if (!tipsContainer) return;

        const tips = [
            {
                title: 'Dynamic Updates',
                text: 'All settings apply instantly without needing to refresh Instagram',
                icon: 'lightning'
            },
            {
                title: 'Multi-Tab Support',
                text: 'Changes automatically sync across all open Instagram tabs',
                icon: 'check'
            },
            {
                title: 'Main Feature Control',
                text: 'When you disable the main "Hide Direct Message" feature, all sub-features are automatically disabled',
                icon: 'info'
            },
            {
                title: 'Customize Your Experience',
                text: 'Enable only the features you need for a personalized distraction-free experience',
                icon: 'check'
            }
        ];

        tipsContainer.innerHTML = UIComponents.tipsSection({
            title: 'Tips for Best Experience',
            description: 'Get the most out of Hide Direct Message',
            tips: tips
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HideDirectMessageSettings();
});
