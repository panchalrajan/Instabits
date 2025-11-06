class Dashboard {
    constructor() {
        this.features = new Map();
        this.toast = document.getElementById('toast');
        this.searchInput = document.getElementById('searchInput');
        this.featuresGrid = document.getElementById('featuresGrid');
        this.noResults = document.getElementById('noResults');
        this.init();
    }

    init() {
        this.loadFeatures();
        this.attachListeners();
    }

    loadFeatures() {
        const toggles = document.querySelectorAll('input[data-feature]');
        toggles.forEach(toggle => {
            const feature = toggle.dataset.feature;
            const saved = localStorage.getItem(feature);
            toggle.checked = saved === 'true';
            this.features.set(feature, toggle.checked);
        });
    }

    attachListeners() {
        // Feature toggles
        document.querySelectorAll('input[data-feature]').forEach(toggle => {
            toggle.addEventListener('change', () => this.handleToggle(toggle));
        });

        // Feature links (CTAs)
        document.querySelectorAll('.feature-link:not(.disabled)').forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
        });

        // Header icon buttons
        document.querySelectorAll('.icon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = btn.getAttribute('title');
                this.showToast(`${title} - Coming soon!`);
            });
        });

        // Search input
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    handleToggle(toggle) {
        const feature = toggle.dataset.feature;
        const enabled = toggle.checked;

        this.features.set(feature, enabled);
        localStorage.setItem(feature, enabled);

        this.showToast(`${this.formatName(feature)} ${enabled ? 'enabled' : 'disabled'}`);
    }

    handleLinkClick(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;

        // For now, just show a toast. Later this will navigate to actual pages
        this.showToast(`Opening ${this.formatName(page)} configuration...`);

        // TODO: Navigate to feature configuration page
        console.log('Navigate to:', page);
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        const cards = document.querySelectorAll('.feature-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const featureName = card.dataset.featureName.toLowerCase();
            const featureTitle = card.querySelector('h3').textContent.toLowerCase();
            const featureDesc = card.querySelector('.feature-description').textContent.toLowerCase();

            const matches = featureName.includes(searchTerm) ||
                          featureTitle.includes(searchTerm) ||
                          featureDesc.includes(searchTerm);

            if (matches) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Show/hide no results message
        if (visibleCount === 0) {
            this.noResults.style.display = 'block';
            this.featuresGrid.style.display = 'none';
        } else {
            this.noResults.style.display = 'none';
            this.featuresGrid.style.display = 'grid';
        }
    }

    showToast(message) {
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        this.toast.textContent = message;
        this.toast.classList.add('show');

        this.toastTimeout = setTimeout(() => {
            this.toast.classList.remove('show');
        }, 2500);
    }

    formatName(str) {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/-/g, ' ')
            .replace(/^./, s => s.toUpperCase())
            .trim();
    }

    // Utility method to get current feature states
    getFeatureStates() {
        const states = {};
        this.features.forEach((enabled, feature) => {
            states[feature] = enabled;
        });
        return states;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
