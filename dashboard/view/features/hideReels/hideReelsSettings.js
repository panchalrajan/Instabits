class HideReelsSettings extends UIComponents.BaseSettingsPage {
    constructor() {
        super();
        this.blockReelsScreen = true;
        this.init();
    }

    async init() {
        console.log('Initializing Hide Reels Settings...');

        this.renderHeader({
            title: 'Hide Reels Settings',
            subtitle: 'Customize how Reels are hidden on Instagram'
        });

        console.log('Header rendered');

        await this.loadBlockReelsScreenSetting();
        this.renderBlockReelsScreenToggle();
        this.setupCommonListeners();

        console.log('Init complete');
    }

    async loadBlockReelsScreenSetting() {
        try {
            const result = await chrome.storage.sync.get('pref_blockReelsScreen');
            this.blockReelsScreen = result.pref_blockReelsScreen !== undefined ? result.pref_blockReelsScreen : true;
        } catch (error) {
            console.error('Error loading block reels screen setting:', error);
            this.blockReelsScreen = true;
        }
    }

    renderBlockReelsScreenToggle() {
        const toggle = document.getElementById('blockReelsScreenToggle');
        if (toggle) {
            toggle.checked = this.blockReelsScreen;

            toggle.addEventListener('change', async (e) => {
                this.blockReelsScreen = e.target.checked;
                await this.saveSettings();
            });
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({
                pref_blockReelsScreen: this.blockReelsScreen
            });

            this.showToast('Settings Saved', 'Block screen: ' + (this.blockReelsScreen ? 'Enabled' : 'Disabled'), 'success');

            await this.notifyContentScript('updateHideReelsSettings', {
                blockReelsScreen: this.blockReelsScreen
            });
        } catch (error) {
            console.error('Error saving hide reels settings:', error);
            this.showToast('Error', 'Failed to save settings', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HideReelsSettings();
});
