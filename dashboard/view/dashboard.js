class Dashboard {
    constructor(featuresData, uiComponents) {
        // Dependency injection
        this.featuresData = featuresData;
        this.uiComponents = uiComponents;

        // State management
        this.features = new Map();
        this.selectedFilters = new Set();
        this.toastManager = new Toast('toast');

        this.init();
    }

    async init() {
        try {
            // Scroll to top on load
            window.scrollTo(0, 0);

            // Render UI components
            this.renderUI();

            // Load feature states from chrome storage
            await this.loadFeatures();

            // Attach event listeners
            this.attachListeners();
        } catch (error) {
            console.error('[InstaBits Dashboard] Error during initialization:', error);
            this.showToast('Error', 'Failed to initialize dashboard', 'error');
        }
    }

    renderUI() {
        // Render header
        document.getElementById('headerContainer').innerHTML = this.uiComponents.header();

        // Render search bar with filter button and dropdown
        const uniqueLabels = this.getUniqueLabels();
        document.getElementById('searchBarContainer').innerHTML = this.uiComponents.searchBar('Search features...', uniqueLabels);

        // Group features by section
        const featuresBySection = this.groupFeaturesBySection();

        // Render sections with their features
        const sectionsHTML = SECTIONS.map(section => {
            const sectionFeatures = featuresBySection[section.id] || [];
            if (sectionFeatures.length === 0) return '';

            const featuresHTML = sectionFeatures.map(feature =>
                this.uiComponents.featureCard(feature)
            ).join('');

            return `
                <div class="features-section" data-section="${section.id}">
                    <h2 class="section-title">${section.name}</h2>
                    <div class="features-grid">
                        ${featuresHTML}
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('featuresGrid').innerHTML = sectionsHTML;

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
     * Group features by section
     * @returns {Object} Object with section IDs as keys and arrays of features as values
     */
    groupFeaturesBySection() {
        const grouped = {};

        this.featuresData.forEach(feature => {
            const section = feature.section || 'other';
            if (!grouped[section]) {
                grouped[section] = [];
            }
            grouped[section].push(feature);
        });

        return grouped;
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

                    // Find feature config to get default enabled state
                    const featureConfig = this.featuresData.find(f => f.id === feature);
                    const defaultEnabled = featureConfig?.defaultEnabled ?? true;

                    // Use stored value if exists, otherwise use default from config
                    const isEnabled = result[storageKey] === undefined ? defaultEnabled : result[storageKey] === true;

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
        try {
            const feature = toggle.dataset.feature;
            const enabled = toggle.checked;
            const storageKey = `instabits_feature_${feature}`;

            this.features.set(feature, enabled);

            // Save to chrome storage
            const data = {};
            data[storageKey] = enabled;
            chrome.storage.sync.set(data, () => {
                if (chrome.runtime.lastError) {
                    console.error('[InstaBits Dashboard] Storage error:', chrome.runtime.lastError);
                    this.showToast('Error', 'Failed to save setting', 'error');
                    // Revert toggle
                    toggle.checked = !enabled;
                    return;
                }

                const featureName = this.formatName(feature);
                const title = enabled ? 'Feature Enabled' : 'Feature Disabled';
                const message = `${featureName} has been ${enabled ? 'enabled' : 'disabled'}.`;
                const type = enabled ? 'success' : 'warning';

                this.showToast(title, message, type);
            });
        } catch (error) {
            console.error('[InstaBits Dashboard] Error toggling feature:', error);
            this.showToast('Error', 'Failed to toggle feature', 'error');
        }
    }

    handleLinkClick(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;

        // Navigate to settings page
        // page is like "seekbarSettings", extract feature name (seekbar)
        if (page) {
            const featureName = page.replace('Settings', '');
            window.location.href = `features/${featureName}/${page}.html`;
        }
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

        // Hide sections that have no visible cards
        const sections = document.querySelectorAll('.features-section');
        sections.forEach(section => {
            const visibleCards = section.querySelectorAll('.feature-card:not(.hidden)');
            if (visibleCards.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });

        // Show/hide no results message
        if (visibleCount === 0) {
            this.noResults.style.display = 'block';
            this.featuresGrid.style.display = 'none';
        } else {
            this.noResults.style.display = 'none';
            this.featuresGrid.style.display = 'flex';
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
        this.toastManager.show(title, message, type);
    }

    hideToast() {
        this.toastManager.hide();
    }

    handleHeaderAction(action) {
        if (action === 'panic') {
            // Use the global panic mode handler
            if (typeof panicModeHandler !== 'undefined') {
                panicModeHandler.togglePanicMode();
            }
            return;
        }

        const actionMessages = {
            favorites: {
                title: 'Rate Extension',
                message: 'Rate InstaBits on the Chrome Web Store'
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
