class HideStoriesSettings extends BaseSettingsPage {
    constructor() {
        super();

        // Settings modes
        this.modes = ['selective', 'all'];
        this.selectedMode = 'selective'; // default mode
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
        await this.loadSettings();

        // Setup UI
        this.renderUI();

        // Setup event listeners
        this.setupCommonListeners();
    }

    async loadSettings() {
        this.selectedMode = await this.loadSetting('hideStoriesMode', 'selective');
        this.blockStoriesScreen = await this.loadSetting('blockStoriesScreen', false);

        console.log('Loaded settings:', {
            mode: this.selectedMode,
            blockStoriesScreen: this.blockStoriesScreen
        });
    }

    renderUI() {
        // Render block screen toggle
        this.renderToggle('blockStoriesScreenToggle', this.blockStoriesScreen, async (checked) => {
            this.blockStoriesScreen = checked;
            await this.saveSettings();
        });

        // Render mode options
        this.renderModeOptions();
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
        const modeText = this.selectedMode === 'all' ? 'Hide All Stories' : 'Selective Hide';

        await this.saveAndNotify(
            {
                hideStoriesMode: this.selectedMode,
                blockStoriesScreen: this.blockStoriesScreen
            },
            'updateHideStoriesSettings',
            `Mode: ${modeText}`
        );
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HideStoriesSettings();
});
