class HideStoriesSettings extends UIComponents.BaseSettingsPage {
    constructor() {
        super();

        // Settings modes
        this.modes = ['selective', 'all'];
        this.selectedMode = 'selective'; // default mode
        this.defaultMode = 'selective';

        this.init();
    }

    async init() {
        // Render header
        this.renderHeader({
            title: 'Hide Stories Settings',
            subtitle: 'Customize how stories are hidden on Instagram'
        });

        // Load saved preference
        await this.loadSavedMode();

        // Setup UI
        this.renderModeOptions();

        // Setup event listeners
        this.setupEventListeners();
    }

    async loadSavedMode() {
        try {
            const result = await chrome.storage.sync.get('pref_hideStoriesMode');
            this.selectedMode = result.pref_hideStoriesMode || this.defaultMode;
            console.log('Loaded hide stories mode:', this.selectedMode);
        } catch (error) {
            console.error('Error loading hide stories mode:', error);
            this.selectedMode = this.defaultMode;
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
            await chrome.storage.sync.set({
                pref_hideStoriesMode: this.selectedMode
            });

            console.log('Hide stories mode saved:', this.selectedMode);

            // Show success toast
            const modeText = this.selectedMode === 'all' ? 'Hide All Stories' : 'Selective Hide';
            this.showToast('Settings Saved', `Mode set to: ${modeText}`, 'success');

            // Notify content scripts to update
            await this.notifyContentScript('updateHideStoriesMode', {
                mode: this.selectedMode
            });

        } catch (error) {
            console.error('Error saving hide stories mode:', error);
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
