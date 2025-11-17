// Grayscale Mode Settings Page
class GrayscaleModeSettings extends BaseSettingsPage {
    constructor() {
        super();
        this.init();
    }

    async init() {
        // Render header
        this.renderHeader({
            title: 'Grayscale Mode',
            subtitle: 'Information about this feature'
        });

        // Inject warning icon
        const warningIcon = document.getElementById('warningIcon');
        if (warningIcon) {
            warningIcon.innerHTML = IconLibrary.get('toast-warning');
        }

        // Setup event listeners
        this.setupCommonListeners();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GrayscaleModeSettings();
});
