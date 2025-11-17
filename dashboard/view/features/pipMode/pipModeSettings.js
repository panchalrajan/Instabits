// PIP Mode Settings Page
class PIPModeSettings extends BaseSettingsPage {
    constructor() {
        super();

        // Features to check
        this.relatedFeatures = [
            {
                id: 'autoScroll',
                name: 'Auto Scroll: Reels',
                description: 'Automatically scroll to next reel when video ends',
                icon: 'scroll'
            },
            {
                id: 'backgroundPlay',
                name: 'Background Play',
                description: 'Keep videos playing in background',
                icon: 'play'
            }
        ];

        this.featureStateManager = new UIComponents.FeatureStateManager(
            this.relatedFeatures.map(f => f.id)
        );

        this.init();
    }

    async init() {
        // Inject info icon
        const infoIconElement = document.getElementById('infoIcon');
        if (infoIconElement) {
            infoIconElement.innerHTML = IconLibrary.get('info');
        }

        // Render header
        this.renderHeader({
            title: 'PIP Mode Settings',
            subtitle: 'Learn about PIP mode and optimize your experience'
        });

        // Load feature states
        await this.featureStateManager.load();

        // Render UI
        this.renderUI();

        // Setup event listeners
        this.setupCommonListeners();
    }

    renderUI() {
        this.renderStatusGrid();
        this.renderTipsSection();
    }

    renderTipsSection() {
        const tipsContainer = document.getElementById('tipsContainer');
        if (!tipsContainer) return;

        const tips = [
            {
                title: 'Enable Auto Scroll: Reels',
                text: 'Automatically moves to the next reel when the current video ends',
                icon: 'check'
            },
            {
                title: 'Enable Background Play',
                text: 'Keeps videos playing when you switch tabs or minimize the browser',
                icon: 'check'
            },
            {
                title: 'Quick Access',
                text: 'PIP button appears on the bottom-left of each reel for instant access',
                icon: 'lightning'
            },
            {
                title: 'Exit Anytime',
                text: 'Click the PIP button again or close the PIP window to exit',
                icon: 'close'
            }
        ];

        tipsContainer.innerHTML = UIComponents.tipsSection({
            title: 'Tips for Best Experience',
            description: 'Get the most out of PIP mode',
            tips: tips
        });
    }

    renderStatusGrid() {
        const statusGrid = document.getElementById('statusGrid');
        if (!statusGrid) return;

        statusGrid.innerHTML = '';

        this.relatedFeatures.forEach(feature => {
            const isEnabled = this.featureStateManager.get(feature.id);

            // Create status item using common component
            const statusItemHtml = UIComponents.statusItem({
                featureId: feature.id,
                name: feature.name,
                description: feature.description,
                icon: feature.icon,
                isEnabled: isEnabled
            });

            statusGrid.insertAdjacentHTML('beforeend', statusItemHtml);
        });

        // Attach event listeners to toggle buttons
        statusGrid.querySelectorAll('.status-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleFeature(btn.dataset.featureId));
        });
    }

    async toggleFeature(featureId) {
        try {
            // Toggle state
            const newState = await this.featureStateManager.toggle(featureId);

            // Re-render status grid
            this.renderStatusGrid();

            // Show toast
            const feature = this.relatedFeatures.find(f => f.id === featureId);
            const title = newState ? 'Feature Enabled' : 'Feature Disabled';
            const message = `${feature.name} has been ${newState ? 'enabled' : 'disabled'}`;
            const type = newState ? 'success' : 'warning';

            this.showToast(title, message, type);

            // Notify content script
            this.notifyContentScript('featureToggled', {
                feature: featureId,
                enabled: newState
            });

        } catch (error) {
            console.error('Error toggling feature:', error);
            this.showToast('Error', 'Failed to update feature', 'error');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PIPModeSettings();
});
