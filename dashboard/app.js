class Dashboard {
    constructor() {
        this.features = new Map();
        this.toast = document.getElementById('toast');
        this.init();
    }

    init() {
        // Scroll to top on load
        window.scrollTo(0, 0);

        // Render UI components
        this.renderUI();

        // Load feature states from localStorage
        this.loadFeatures();

        // Attach event listeners
        this.attachListeners();
    }

    renderUI() {
        // Render header
        document.getElementById('headerContainer').innerHTML = UIComponents.header();

        // Render search bar
        document.getElementById('searchBarContainer').innerHTML = UIComponents.searchBar();

        // Render feature cards
        const featuresHTML = FEATURES_DATA.map(feature =>
            UIComponents.featureCard(feature)
        ).join('');
        document.getElementById('featuresGrid').innerHTML = featuresHTML;

        // Render no results message
        document.getElementById('noResultsContainer').innerHTML = UIComponents.noResults();

        // Cache DOM elements after rendering
        this.searchInput = document.getElementById('searchInput');
        this.featuresGrid = document.getElementById('featuresGrid');
        this.noResults = document.getElementById('noResults');
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
        document.querySelectorAll('.icon-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleHeaderAction(action);
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

        const featureName = this.formatName(feature);
        const title = enabled ? 'Feature Enabled' : 'Feature Disabled';
        const message = `${featureName} has been ${enabled ? 'enabled' : 'disabled'}`;
        const type = enabled ? 'success' : 'warning';

        this.showToast(title, message, type);
    }

    handleLinkClick(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;

        this.showToast(
            'Opening Configuration',
            `${this.formatName(page)} settings will open soon`,
            'info'
        );

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

    showToast(title, message, type = 'info') {
        // Clear any existing toast timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        // Remove existing toast immediately if showing
        if (this.toast.classList.contains('show')) {
            this.toast.classList.remove('show');

            // Wait for slide out animation before showing new toast
            setTimeout(() => {
                this.displayToast(title, message, type);
            }, 200);
        } else {
            this.displayToast(title, message, type);
        }
    }

    displayToast(title, message, type) {
        // Remove all type classes
        this.toast.className = 'toast';

        // Add the appropriate type class
        this.toast.classList.add(`toast-${type}`);

        // Use UIComponents to generate toast HTML
        this.toast.innerHTML = UIComponents.toast({ title, message, type });

        // Show toast with animation
        requestAnimationFrame(() => {
            this.toast.classList.add('show');
        });

        // Auto hide after 3 seconds
        this.toastTimeout = setTimeout(() => {
            this.hideToast();
        }, 3000);
    }

    hideToast() {
        this.toast.classList.remove('show');
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
    }

    handleHeaderAction(action) {
        const actionMessages = {
            favorites: {
                title: 'Favorites',
                message: 'Your favorite features will appear here soon'
            },
            feedback: {
                title: 'Feedback',
                message: 'Share your thoughts and suggestions with us'
            },
            settings: {
                title: 'Settings',
                message: 'Global settings will be available soon'
            }
        };

        const actionData = actionMessages[action] || {
            title: 'Coming Soon',
            message: 'This feature will be available soon'
        };

        this.showToast(actionData.title, actionData.message, 'info');
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
