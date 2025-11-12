// Seekbar Settings Page
class SeekbarSettings {
    constructor() {
        this.colors = [
            { name: 'Instagram Blue', value: '#0095f6' },
            { name: 'Red', value: '#ef4444' },
            { name: 'Orange', value: '#f97316' },
            { name: 'Pink', value: '#ec4899' },
            { name: 'Purple', value: '#a855f7' },
            { name: 'Violet', value: '#8b5cf6' },
            { name: 'Indigo', value: '#6366f1' },
            { name: 'Blue', value: '#3b82f6' },
            { name: 'Sky Blue', value: '#0ea5e9' },
            { name: 'Cyan', value: '#06b6d4' },
            { name: 'Teal', value: '#14b8a6' },
            { name: 'Emerald', value: '#10b981' },
            { name: 'Green', value: '#22c55e' },
            { name: 'Lime', value: '#84cc16' },
            { name: 'Yellow', value: '#eab308' },
            { name: 'Amber', value: '#f59e0b' },
            { name: 'Rose', value: '#f43f5e' },
            { name: 'Fuchsia', value: '#d946ef' },
            { name: 'White', value: '#ffffff' },
            { name: 'Gray', value: '#6b7280' }
        ];

        this.selectedColor = '#0095f6'; // Default Instagram blue
        this.defaultColor = '#0095f6';

        this.init();
    }

    async init() {
        // Load saved color preference
        await this.loadSavedColor();

        // Render color options
        this.renderColorGrid();

        // Update preview
        this.updatePreview();

        // Setup event listeners
        this.setupEventListeners();
    }

    async loadSavedColor() {
        try {
            const result = await chrome.storage.sync.get('pref_seekbarProgressColor');
            this.selectedColor = result.pref_seekbarProgressColor || this.defaultColor;
        } catch (error) {
            console.error('Error loading saved color:', error);
            this.selectedColor = this.defaultColor;
        }
    }

    renderColorGrid() {
        const colorGrid = document.getElementById('colorGrid');
        if (!colorGrid) return;

        colorGrid.innerHTML = '';

        this.colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.background = color.value;
            colorOption.dataset.color = color.value;
            colorOption.title = color.name;

            if (color.value === this.selectedColor) {
                colorOption.classList.add('selected');
            }

            colorOption.addEventListener('click', () => {
                this.selectColor(color.value);
            });

            colorGrid.appendChild(colorOption);
        });
    }

    selectColor(color) {
        this.selectedColor = color;

        // Update selected state in UI
        document.querySelectorAll('.color-option').forEach(option => {
            if (option.dataset.color === color) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });

        // Update preview
        this.updatePreview();
    }

    updatePreview() {
        const previewProgress = document.getElementById('previewProgress');
        if (previewProgress) {
            previewProgress.style.background = this.selectedColor;
        }
    }

    setupEventListeners() {
        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetToDefault();
            });
        }
    }

    async saveSettings() {
        try {
            // Save to storage
            await chrome.storage.sync.set({
                pref_seekbarProgressColor: this.selectedColor
            });

            // Show success message
            this.showToast('Settings Saved', 'Your seekbar color has been updated successfully', 'success');

            // Optional: Notify content script to update colors immediately
            this.notifyContentScript();

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Error', 'Failed to save settings. Please try again.', 'error');
        }
    }

    async notifyContentScript() {
        try {
            // Get all tabs with Instagram
            const tabs = await chrome.tabs.query({ url: '*://*.instagram.com/*' });

            // Send message to all Instagram tabs to update seekbar colors
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'updateSeekbarColor',
                    color: this.selectedColor
                }).catch(() => {
                    // Tab might not have content script loaded, ignore error
                });
            });
        } catch (error) {
            // Ignore errors, this is just for immediate updates
            console.log('Could not notify content script:', error);
        }
    }

    resetToDefault() {
        this.selectColor(this.defaultColor);
        this.showToast('Reset', 'Seekbar color has been reset to default', 'info');
    }

    showToast(title, message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 13px; color: var(--text-secondary);">${message}</div>
        `;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SeekbarSettings();
});
