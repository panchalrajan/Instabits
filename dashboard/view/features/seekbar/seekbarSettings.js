// Seekbar Settings Page
class SeekbarSettings extends BaseSettingsPage {
    constructor() {
        super();

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

        this.init();
    }

    async init() {
        // Render header using base class method
        this.renderHeader({
            title: 'Seekbar Settings',
            subtitle: 'Customize your video seekbar appearance'
        });

        // Load saved color preference
        await this.loadSettings();

        // Render UI
        this.renderUI();

        // Setup event listeners
        this.setupCommonListeners();
    }

    async loadSettings() {
        this.selectedColor = await this.loadSetting('seekbarProgressColor', '#0095f6');
    }

    renderUI() {
        this.renderColorGrid();
        this.updatePreview();
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

        // Auto-save
        this.saveSettings();
    }

    updatePreview() {
        const previewProgress = document.getElementById('previewProgress');
        if (previewProgress) {
            previewProgress.style.background = this.selectedColor;
        }
    }

    async saveSettings() {
        await this.saveAndNotify(
            { seekbarProgressColor: this.selectedColor },
            'updateSeekbarColor',
            'Color updated'
        );
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SeekbarSettings();
});
