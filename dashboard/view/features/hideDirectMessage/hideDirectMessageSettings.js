class HideDirectMessageSettings extends UIComponents.BaseSettingsPage {
    constructor() {
        super();
        this.blockDirectScreen = true;
        this.hideFloatingButton = true;
        this.disableMessageButton = false;
        this.init();
    }

    async init() {
        console.log('Initializing Hide Direct Messages Settings...');

        this.renderHeader({
            title: 'Hide Direct Messages Settings',
            subtitle: 'Customize how Direct Messages are hidden on Instagram'
        });

        console.log('Header rendered');

        await this.loadSettings();
        this.renderToggles();
        this.setupCommonListeners();

        console.log('Init complete');
    }

    async loadSettings() {
        try {
            this.blockDirectScreen = await storageService.getUserPreference('blockDirectScreen', true);
            this.hideFloatingButton = await storageService.getUserPreference('hideFloatingButton', true);
            this.disableMessageButton = await storageService.getUserPreference('disableMessageButton', false);
        } catch (error) {
            console.error('Error loading hide direct messages settings:', error);
            this.blockDirectScreen = true;
            this.hideFloatingButton = true;
            this.disableMessageButton = false;
        }
    }

    renderToggles() {
        // Block Direct Screen Toggle
        const blockScreenToggle = document.getElementById('blockDirectScreenToggle');
        if (blockScreenToggle) {
            blockScreenToggle.checked = this.blockDirectScreen;
            blockScreenToggle.addEventListener('change', async (e) => {
                this.blockDirectScreen = e.target.checked;
                await this.saveSettings();
            });
        }

        // Hide Floating Button Toggle
        const floatingButtonToggle = document.getElementById('hideFloatingButtonToggle');
        if (floatingButtonToggle) {
            floatingButtonToggle.checked = this.hideFloatingButton;
            floatingButtonToggle.addEventListener('change', async (e) => {
                this.hideFloatingButton = e.target.checked;
                await this.saveSettings();
            });
        }

        // Disable Message Button Toggle
        const messageButtonToggle = document.getElementById('disableMessageButtonToggle');
        if (messageButtonToggle) {
            messageButtonToggle.checked = this.disableMessageButton;
            messageButtonToggle.addEventListener('change', async (e) => {
                this.disableMessageButton = e.target.checked;
                await this.saveSettings();
            });
        }
    }

    async saveSettings() {
        try {
            await storageService.setUserPreference('blockDirectScreen', this.blockDirectScreen);
            await storageService.setUserPreference('hideFloatingButton', this.hideFloatingButton);
            await storageService.setUserPreference('disableMessageButton', this.disableMessageButton);

            this.showToast('Settings Saved', 'Your preferences have been updated', 'success');

            await this.notifyContentScript('updateHideDirectMessageSettings', {
                blockDirectScreen: this.blockDirectScreen,
                hideFloatingButton: this.hideFloatingButton,
                disableMessageButton: this.disableMessageButton
            });
        } catch (error) {
            console.error('Error saving hide direct messages settings:', error);
            this.showToast('Error', 'Failed to save settings', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HideDirectMessageSettings();
    document.getElementById('infoIcon').innerHTML = IconLibrary.get('info');
});
