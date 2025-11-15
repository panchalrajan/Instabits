class HideReelsSettings extends BaseSettingsPage {
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

        await this.loadSettings();
        this.renderUI();
        this.setupCommonListeners();

        console.log('Init complete');
    }

    async loadSettings() {
        this.blockReelsScreen = await this.loadSetting('blockReelsScreen', true);
    }

    renderUI() {
        this.renderToggle('blockReelsScreenToggle', this.blockReelsScreen, async (checked) => {
            this.blockReelsScreen = checked;
            await this.saveSettings();
        });
    }

    async saveSettings() {
        await this.saveAndNotify(
            { blockReelsScreen: this.blockReelsScreen },
            'updateHideReelsSettings',
            'Block screen: ' + (this.blockReelsScreen ? 'Enabled' : 'Disabled')
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HideReelsSettings();
    document.getElementById('infoIcon').innerHTML = IconLibrary.get('info');
});
