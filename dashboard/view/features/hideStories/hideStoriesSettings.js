class HideStoriesSettings extends UIComponents.BaseSettingsPage {
    constructor() {
        super();

        // Settings modes
        this.modes = ['selective', 'all'];
        this.selectedMode = 'selective'; // default mode
        this.defaultMode = 'selective';
        this.blockStoriesScreen = false; // default: don't block stories screen

        this.init();
    }

    async init() {
        // Render header
        this.renderHeader({
            title: 'Hide Stories Settings',
            subtitle: 'Customize how stories are hidden on Instagram'
        });

        // Load saved preferences
        await this.loadSavedMode();
        await this.loadBlockStoriesScreenSetting();

        // Setup UI
        this.renderModeOptions();
        this.renderBlockStoriesScreenToggle();

        // Setup event listeners
        this.setupEventListeners();
    }

    async loadSavedMode() {
        try {
            this.selectedMode = await storageService.getUserPreference('hideStoriesMode', this.defaultMode);
            console.log('Loaded hide stories mode:', this.selectedMode);
        } catch (error) {
            console.error('Error loading hide stories mode:', error);
            this.selectedMode = this.defaultMode;
        }
    }

    async loadBlockStoriesScreenSetting() {
        try {
            this.blockStoriesScreen = await storageService.getUserPreference('blockStoriesScreen', false);
            console.log('Loaded block stories screen setting:', this.blockStoriesScreen);
        } catch (error) {
            console.error('Error loading block stories screen setting:', error);
            this.blockStoriesScreen = false;
        }
    }

    renderBlockStoriesScreenToggle() {
        const toggle = document.getElementById('blockStoriesScreenToggle');
        if (toggle) {
            toggle.checked = this.blockStoriesScreen;

            toggle.addEventListener('change', async (e) => {
                this.blockStoriesScreen = e.target.checked;
                await this.saveSettings();
            });
        }
    }

    renderModeOptions() {
        const modeOptions = document.querySelectorAll('.mode-option');

        modeOptions.forEach(option => {
            const mode = option.dataset.mode;

            // Set selected state
            if (mode === this.selectedMode) {
                option.classList.add('selected');
            }

            // Add click listener
            option.addEventListener('click', () => {
                this.selectMode(mode);
            });
        });
    }

    async selectMode(mode) {
        if (mode === this.selectedMode) {
            return; // Already selected
        }

        // Update UI
        const allOptions = document.querySelectorAll('.mode-option');
        allOptions.forEach(opt => opt.classList.remove('selected'));

        const selectedOption = document.querySelector(`.mode-option[data-mode="${mode}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // Update state
        this.selectedMode = mode;

        // Save to storage
        await this.saveSettings();
    }

    async saveSettings() {
        try {
            await storageService.setUserPreference('hideStoriesMode', this.selectedMode);
            await storageService.setUserPreference('blockStoriesScreen', this.blockStoriesScreen);

            console.log('Hide stories settings saved:', {
                mode: this.selectedMode,
                blockStoriesScreen: this.blockStoriesScreen
            });

            // Show success toast
            const modeText = this.selectedMode === 'all' ? 'Hide All Stories' : 'Selective Hide';
            this.showToast('Settings Saved', `Mode: ${modeText}`, 'success');

            // Notify content scripts to update
            await this.notifyContentScript('updateHideStoriesSettings', {
                mode: this.selectedMode,
                blockStoriesScreen: this.blockStoriesScreen
            });

        } catch (error) {
            console.error('Error saving hide stories settings:', error);
            this.showToast('Error', 'Failed to save settings', 'error');
        }
    }

    setupEventListeners() {
        // Setup common listeners (back button, etc.)
        this.setupCommonListeners();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HideStoriesSettings();
});
