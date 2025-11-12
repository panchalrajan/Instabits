class Dashboard {
    constructor(featuresData, uiComponents) {
        // Dependency injection
        this.featuresData = featuresData;
        this.uiComponents = uiComponents;

        // State management
        this.features = new Map();
        this.selectedFilters = new Set();
        this.toast = document.getElementById('toast');

        this.init();
    }

    async init() {
        // Scroll to top on load
        window.scrollTo(0, 0);

        // Render UI components
        this.renderUI();

        // Load feature states from chrome storage
        await this.loadFeatures();

        // Attach event listeners
        this.attachListeners();
    }

    renderUI() {
        // Render header
        document.getElementById('headerContainer').innerHTML = this.uiComponents.header();

        // Render search bar with filter button and dropdown
        const uniqueLabels = this.getUniqueLabels();
        document.getElementById('searchBarContainer').innerHTML = this.uiComponents.searchBar('Search features...', uniqueLabels);

        // Render feature cards
        const featuresHTML = this.featuresData.map(feature =>
            this.uiComponents.featureCard(feature)
        ).join('');
        document.getElementById('featuresGrid').innerHTML = featuresHTML;

        // Render no results message
        document.getElementById('noResultsContainer').innerHTML = this.uiComponents.noResults();

        // Cache DOM elements after rendering
        this.searchInput = document.getElementById('searchInput');
        this.featuresGrid = document.getElementById('featuresGrid');
        this.noResults = document.getElementById('noResults');
        this.filterBtn = document.getElementById('filterBtn');
        this.filterDropdown = document.getElementById('filterDropdown');
        this.filterCount = document.getElementById('filterCount');
        this.filterClear = document.getElementById('filterClear');

        // Update label counts
        this.updateLabelCounts();
    }

    /**
     * Extract unique labels from featuresData
     * @returns {Array} Array of unique label objects with text and color
     */
    getUniqueLabels() {
        const labelsMap = new Map();

        this.featuresData.forEach(feature => {
            if (feature.badge && feature.badge.text) {
                labelsMap.set(feature.badge.text, {
                    text: feature.badge.text,
                    color: feature.badge.color
                });
            }
        });

        return Array.from(labelsMap.values());
    }

    /**
     * Update the count of features for each label
     */
    updateLabelCounts() {
        const labelCounts = new Map();

        // Count features for each label
        this.featuresData.forEach(feature => {
            if (feature.badge && feature.badge.text) {
                const count = labelCounts.get(feature.badge.text) || 0;
                labelCounts.set(feature.badge.text, count + 1);
            }
        });

        // Update count displays
        labelCounts.forEach((count, label) => {
            const countElement = document.querySelector(`[data-label-count="${label}"]`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    async loadFeatures() {
        const toggles = document.querySelectorAll('input[data-feature]');

        // Get all storage keys for features
        const storageKeys = Array.from(toggles).map(t => `instabits_feature_${t.dataset.feature}`);

        return new Promise((resolve) => {
            chrome.storage.sync.get(storageKeys, (result) => {
                toggles.forEach(toggle => {
                    const feature = toggle.dataset.feature;
                    const storageKey = `instabits_feature_${feature}`;
                    // Default to enabled if not set
                    const isEnabled = result[storageKey] === undefined ? true : result[storageKey] === true;
                    toggle.checked = isEnabled;
                    this.features.set(feature, isEnabled);
                });
                resolve();
            });
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
        this.searchInput.addEventListener('input', (e) => this.handleSearchAndFilter(e.target.value));

        // Filter button
        this.filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFilterDropdown();
        });

        // Filter checkboxes
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleFilterChange(e));
        });

        // Clear filters button
        this.filterClear.addEventListener('click', () => this.clearAllFilters());

        // Close filter dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.filterBtn.contains(e.target) && !this.filterDropdown.contains(e.target)) {
                this.filterDropdown.style.display = 'none';
            }
        });
    }

    handleToggle(toggle) {
        const feature = toggle.dataset.feature;
        const enabled = toggle.checked;
        const storageKey = `instabits_feature_${feature}`;

        this.features.set(feature, enabled);

        // Save to chrome storage
        const data = {};
        data[storageKey] = enabled;
        chrome.storage.sync.set(data, () => {
            const featureName = this.formatName(feature);
            const title = enabled ? 'Feature Enabled' : 'Feature Disabled';
            const message = `${featureName} has been ${enabled ? 'enabled' : 'disabled'}.`;
            const type = enabled ? 'success' : 'warning';

            this.showToast(title, message, type);
        });
    }

    handleLinkClick(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;

        this.showToast(
            'Opening Configuration',
            `${this.formatName(page)} settings will open soon`,
            'info'
        );
    }

    handleSearchAndFilter(query) {
        const searchTerm = query.toLowerCase().trim();
        const cards = document.querySelectorAll('.feature-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const featureName = card.dataset.featureName.toLowerCase();
            const featureTitle = card.querySelector('h3').textContent.toLowerCase();
            const featureDesc = card.querySelector('.feature-description').textContent.toLowerCase();

            // Check search match
            const searchMatches = !searchTerm ||
                featureName.includes(searchTerm) ||
                featureTitle.includes(searchTerm) ||
                featureDesc.includes(searchTerm);

            // Check filter match
            let filterMatches = true;
            if (this.selectedFilters.size > 0) {
                const badge = card.querySelector('.badge');
                const badgeText = badge ? badge.textContent.trim() : null;
                filterMatches = badgeText && this.selectedFilters.has(badgeText);
            }

            if (searchMatches && filterMatches) {
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

    /**
     * Toggle filter dropdown visibility
     */
    toggleFilterDropdown() {
        const isVisible = this.filterDropdown.style.display === 'block';
        this.filterDropdown.style.display = isVisible ? 'none' : 'block';
    }

    /**
     * Handle filter checkbox change
     */
    handleFilterChange(e) {
        const checkbox = e.target;
        const label = checkbox.dataset.label;

        if (checkbox.checked) {
            this.selectedFilters.add(label);
        } else {
            this.selectedFilters.delete(label);
        }

        this.updateFilterCount();
        this.handleSearchAndFilter(this.searchInput.value);
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        this.selectedFilters.clear();
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateFilterCount();
        this.handleSearchAndFilter(this.searchInput.value);
    }

    /**
     * Update filter count badge
     */
    updateFilterCount() {
        const count = this.selectedFilters.size;
        if (count > 0) {
            this.filterCount.textContent = count;
            this.filterCount.style.display = 'inline-flex';
            this.filterBtn.classList.add('filter-active');
        } else {
            this.filterCount.style.display = 'none';
            this.filterBtn.classList.remove('filter-active');
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
    // Create Dashboard instance with dependency injection
    window.dashboard = new Dashboard(FEATURES_DATA, UIComponents);
});
