class HideDirectMessageSettings extends UIComponents.BaseSettingsPage {
    constructor() {
        super();
        this.blockDirectScreen = true;
        this.init();
    }

    async init() {
        console.log('Initializing Hide Direct Messages Settings...');

        this.renderHeader({
            title: 'Hide Direct Messages Settings',
            subtitle: 'Customize how Direct Messages are hidden on Instagram'
        });

        console.log('Header rendered');

        await this.loadBlockDirectScreenSetting();
        this.renderBlockDirectScreenToggle();
        this.setupCommonListeners();

        console.log('Init complete');
    }

    async loadBlockDirectScreenSetting() {
        try {
            this.blockDirectScreen = await storageService.getUserPreference('blockDirectScreen', true);
        } catch (error) {
            console.error('Error loading block direct screen setting:', error);
            this.blockDirectScreen = true;
        }
    }

    renderBlockDirectScreenToggle() {
        const toggle = document.getElementById('blockDirectScreenToggle');
        if (toggle) {
            toggle.checked = this.blockDirectScreen;

            toggle.addEventListener('change', async (e) => {
                this.blockDirectScreen = e.target.checked;
                await this.saveSettings();
            });
        }
    }

    async saveSettings() {
        try {
            await storageService.setUserPreference('blockDirectScreen', this.blockDirectScreen);

            this.showToast('Settings Saved', 'Block screen: ' + (this.blockDirectScreen ? 'Enabled' : 'Disabled'), 'success');

            await this.notifyContentScript('updateHideDirectMessageSettings', {
                blockDirectScreen: this.blockDirectScreen
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
