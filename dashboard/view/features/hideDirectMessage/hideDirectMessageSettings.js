class HideDirectMessageSettings extends BaseSettingsPage {
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
        this.renderUI();
        this.setupCommonListeners();

        console.log('Init complete');
    }

    async loadSettings() {
        this.blockDirectScreen = await this.loadSetting('blockDirectScreen', true);
        this.hideFloatingButton = await this.loadSetting('hideFloatingButton', true);
        this.disableMessageButton = await this.loadSetting('disableMessageButton', false);
    }

    renderUI() {
        // Block Direct Screen Toggle
        this.renderToggle('blockDirectScreenToggle', this.blockDirectScreen, async (checked) => {
            this.blockDirectScreen = checked;
            await this.saveSettings();
        });

        // Hide Floating Button Toggle
        this.renderToggle('hideFloatingButtonToggle', this.hideFloatingButton, async (checked) => {
            this.hideFloatingButton = checked;
            await this.saveSettings();
        });

        // Disable Message Button Toggle
        this.renderToggle('disableMessageButtonToggle', this.disableMessageButton, async (checked) => {
            this.disableMessageButton = checked;
            await this.saveSettings();
        });
    }

    async saveSettings() {
        await this.saveAndNotify(
            {
                blockDirectScreen: this.blockDirectScreen,
                hideFloatingButton: this.hideFloatingButton,
                disableMessageButton: this.disableMessageButton
            },
            'updateHideDirectMessageSettings',
            'Your preferences have been updated'
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HideDirectMessageSettings();
    document.getElementById('infoIcon').innerHTML = IconLibrary.get('info');
});
