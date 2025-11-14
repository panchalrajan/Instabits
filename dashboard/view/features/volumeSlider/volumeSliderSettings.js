class VolumeSliderSettings extends UIComponents.BaseSettingsPage {
    constructor() {
        super();
        this.persistVolume = true;
        this.persistMuteState = false;
        this.init();
    }

    async init() {
        console.log('Initializing Volume Control Settings...');

        this.renderHeader({
            title: 'Volume Control Settings',
            subtitle: 'Customize volume and mute persistence behavior'
        });

        console.log('Header rendered');

        await this.loadSettings();
        this.renderToggles();
        this.setupCommonListeners();

        console.log('Init complete');
    }

    async loadSettings() {
        try {
            this.persistVolume = await storageService.getUserPreference('persistVolume', true);
            this.persistMuteState = await storageService.getUserPreference('persistMuteState', false);
        } catch (error) {
            console.error('Error loading volume control settings:', error);
            this.persistVolume = true;
            this.persistMuteState = false;
        }
    }

    renderToggles() {
        // Persist Volume Toggle
        const persistVolumeToggle = document.getElementById('persistVolumeToggle');
        if (persistVolumeToggle) {
            persistVolumeToggle.checked = this.persistVolume;
            persistVolumeToggle.addEventListener('change', async (e) => {
                this.persistVolume = e.target.checked;
                await this.saveSettings();
            });
        }

        // Persist Mute State Toggle
        const persistMuteStateToggle = document.getElementById('persistMuteStateToggle');
        if (persistMuteStateToggle) {
            persistMuteStateToggle.checked = this.persistMuteState;
            persistMuteStateToggle.addEventListener('change', async (e) => {
                this.persistMuteState = e.target.checked;
                await this.saveSettings();
            });
        }
    }

    async saveSettings() {
        try {
            await storageService.setUserPreference('persistVolume', this.persistVolume);
            await storageService.setUserPreference('persistMuteState', this.persistMuteState);

            this.showToast('Settings Saved', 'Your preferences have been updated', 'success');

            await this.notifyContentScript('updateVolumeSliderSettings', {
                persistVolume: this.persistVolume,
                persistMuteState: this.persistMuteState
            });
        } catch (error) {
            console.error('Error saving volume control settings:', error);
            this.showToast('Error', 'Failed to save settings', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VolumeSliderSettings();
    document.getElementById('infoIcon').innerHTML = IconLibrary.get('info');
});
