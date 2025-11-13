// Playback Speed Settings Page
class PlaybackSpeedSettings {
    constructor() {
        this.toastManager = new Toast('toast');

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
        // Render header
        this.renderHeader();

        // Load saved speed preferences
        await this.loadSavedSpeeds();

        // Render speed options
        this.renderSpeedOptions();

        // Setup event listeners
        this.setupEventListeners();
    }

    renderHeader() {
        const headerContainer = document.getElementById('headerContainer');
        if (headerContainer) {
            headerContainer.innerHTML = UIComponents.header({
                icon: '../../../../icons/icon_128.png',
                title: 'Playback Speed Settings',
                subtitle: 'Customize which playback speed options you want to see',
                buttons: null,
                showBackButton: true,
                backButtonUrl: '../../index.html'
            });
        }
    }

    async loadSavedSpeeds() {
        try {
            const result = await chrome.storage.sync.get('pref_enabledPlaybackSpeeds');
            if (result.pref_enabledPlaybackSpeeds && Array.isArray(result.pref_enabledPlaybackSpeeds)) {
                this.enabledSpeeds = result.pref_enabledPlaybackSpeeds;
            } else {
                this.enabledSpeeds = [...this.defaultEnabledSpeeds];
            }
        } catch (error) {
            console.error('Error loading saved speeds:', error);
            this.enabledSpeeds = [...this.defaultEnabledSpeeds];
        }
    }

    renderSpeedOptions() {
        const speedGrid = document.getElementById('speedOptionsGrid');
        if (!speedGrid) return;

        speedGrid.innerHTML = '';

        this.availableSpeeds.forEach(speed => {
            const speedOption = document.createElement('div');
            speedOption.className = 'speed-option-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `speed-${speed.value}`;
            checkbox.className = 'speed-checkbox';
            checkbox.value = speed.value;
            checkbox.checked = this.enabledSpeeds.includes(speed.value);

            const label = document.createElement('label');
            label.htmlFor = `speed-${speed.value}`;
            label.className = 'speed-label';
            label.textContent = speed.label;

            speedOption.appendChild(checkbox);
            speedOption.appendChild(label);

            checkbox.addEventListener('change', (e) => {
                this.handleSpeedToggle(speed.value, e.target.checked);
            });

            speedGrid.appendChild(speedOption);
        });
    }

    handleSpeedToggle(speedValue, isChecked) {
        if (isChecked) {
            // Add speed to enabled list
            if (!this.enabledSpeeds.includes(speedValue)) {
                this.enabledSpeeds.push(speedValue);
                this.enabledSpeeds.sort((a, b) => a - b); // Keep sorted
            }
        } else {
            // Check if at least one speed will remain
            if (this.enabledSpeeds.length <= 1) {
                this.toastManager.show('Error', 'At least one speed option must remain enabled', 'error');
                // Revert the checkbox
                const checkbox = document.getElementById(`speed-${speedValue}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
                return;
            }

            // Remove speed from enabled list
            this.enabledSpeeds = this.enabledSpeeds.filter(s => s !== speedValue);
        }

        // Auto-save
        this.saveSettings();
    }

    setupEventListeners() {
        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }
    }

    async saveSettings() {
        try {
            // Save to storage
            await chrome.storage.sync.set({
                pref_enabledPlaybackSpeeds: this.enabledSpeeds
            });

            // Show success message (brief)
            this.toastManager.show('Saved', 'Speed options updated', 'success');

            // Notify content script to update speeds immediately
            this.notifyContentScript();

        } catch (error) {
            console.error('Error saving settings:', error);
            this.toastManager.show('Error', 'Failed to save', 'error');
        }
    }

    async notifyContentScript() {
        try {
            // Get all tabs with Instagram
            const tabs = await chrome.tabs.query({ url: '*://*.instagram.com/*' });

            // Send message to all Instagram tabs to update playback speed options
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'updatePlaybackSpeeds',
                    speeds: this.enabledSpeeds
                }).catch(() => {
                    // Tab might not have content script loaded, ignore error
                });
            });
        } catch (error) {
            // Ignore errors, this is just for immediate updates
            console.log('Could not notify content script:', error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PlaybackSpeedSettings();
});
