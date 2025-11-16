// Playback Speed Settings Page
class PlaybackSpeedSettings extends BaseSettingsPage {
    constructor() {
        super();

        // Available speed options (all possible speeds)
        this.availableSpeeds = [
            { value: 0.25, label: '0.25x' },
            { value: 0.5, label: '0.5x' },
            { value: 1.0, label: '1x (Normal)' },
            { value: 1.25, label: '1.25x' },
            { value: 1.5, label: '1.5x' },
            { value: 2.0, label: '2x' },
            { value: 3.0, label: '3x' }
        ];

        // Default enabled speeds (all enabled by default)
        this.defaultEnabledSpeeds = [0.25, 0.5, 1.0, 1.25, 1.5, 2.0, 3.0];

        // Currently enabled speeds
        this.enabledSpeeds = [...this.defaultEnabledSpeeds];

        this.init();
    }

    async init() {
        // Render header using base class method
        this.renderHeader({
            title: 'Playback Speed Settings',
            subtitle: 'Customize which playback speed options you want to see'
        });

        // Load saved speed preferences
        await this.loadSettings();

        // Render speed options
        this.renderUI();

        // Setup event listeners
        this.setupCommonListeners();
    }

    async loadSettings() {
        const result = await this.loadSetting('enabledPlaybackSpeeds', this.defaultEnabledSpeeds);
        if (result && Array.isArray(result)) {
            this.enabledSpeeds = result;
        } else {
            this.enabledSpeeds = [...this.defaultEnabledSpeeds];
        }
    }

    renderUI() {
        this.renderSpeedOptions();
    }

    renderSpeedOptions() {
        const speedGrid = document.getElementById('speedOptionsGrid');
        if (!speedGrid) return;

        speedGrid.innerHTML = '';

        this.availableSpeeds.forEach(speed => {
            const isSelected = this.enabledSpeeds.includes(speed.value);
            const isNormal = speed.value === 1.0;
            const isDisabled = isNormal; // 1x is always disabled (can't be unchecked)

            const speedOption = document.createElement('div');
            speedOption.className = 'speed-option';
            if (isSelected) speedOption.classList.add('speed-selected');
            if (isDisabled) speedOption.classList.add('speed-disabled');

            // Hidden checkbox for accessibility
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `speed-${speed.value}`;
            checkbox.className = 'speed-checkbox';
            checkbox.value = speed.value;
            checkbox.checked = isSelected;
            checkbox.disabled = isDisabled;

            // Label
            const label = document.createElement('span');
            label.className = 'speed-label';
            label.textContent = speed.value + 'x';

            // Description
            const description = document.createElement('span');
            description.className = 'speed-description';
            if (isNormal) {
                description.textContent = 'Normal (Required)';
            } else if (speed.value < 1.0) {
                description.textContent = 'Slower';
            } else {
                description.textContent = 'Faster';
            }

            // Checkmark for selected items
            if (isSelected) {
                const checkmark = document.createElement('span');
                checkmark.className = 'speed-checkmark';
                checkmark.innerHTML = '✓';
                speedOption.appendChild(checkmark);
            }

            speedOption.appendChild(checkbox);
            speedOption.appendChild(label);
            speedOption.appendChild(description);

            // Click handler (only if not disabled)
            if (!isDisabled) {
                speedOption.addEventListener('click', () => {
                    checkbox.checked = !checkbox.checked;
                    this.handleSpeedToggle(speed.value, checkbox.checked);
                });
            }

            speedGrid.appendChild(speedOption);
        });
    }

    handleSpeedToggle(speedValue, isChecked) {
        // Prevent disabling 1x (it's always required)
        if (speedValue === 1.0 && !isChecked) {
            return;
        }

        if (isChecked) {
            // Add speed to enabled list
            if (!this.enabledSpeeds.includes(speedValue)) {
                this.enabledSpeeds.push(speedValue);
                this.enabledSpeeds.sort((a, b) => a - b); // Keep sorted
            }
        } else {
            // Remove speed from enabled list
            this.enabledSpeeds = this.enabledSpeeds.filter(s => s !== speedValue);
        }

        // Ensure 1x is always in the list
        if (!this.enabledSpeeds.includes(1.0)) {
            this.enabledSpeeds.push(1.0);
            this.enabledSpeeds.sort((a, b) => a - b);
        }

        // Re-render to update UI
        this.renderSpeedOptions();

        // Auto-save
        this.saveSettings();
    }

    async saveSettings() {
        await this.saveAndNotify(
            { enabledPlaybackSpeeds: this.enabledSpeeds },
            'updatePlaybackSpeeds',
            'Speed options updated'
        );
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PlaybackSpeedSettings();
});
