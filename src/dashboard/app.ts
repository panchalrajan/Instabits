/**
 * Dashboard Application
 * Modern TypeScript implementation preserving original design
 */

import './styles.css';
import './toast.css';
import { FEATURES_DATA, SECTIONS } from './data';
import { getIcon } from './icons';
import type { FeatureData, ToastOptions } from './types';

class Dashboard {
  private featuresData: FeatureData[] = FEATURES_DATA;
  private activeFilters: Set<string> = new Set();

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.renderHeader();
    this.renderSearchBar();
    this.renderFeatures();
    this.renderNoResults();

    await this.loadFeatureStates();
    this.setupEventListeners();
  }

  private renderHeader(): void {
    const container = document.getElementById('headerContainer')!;
    container.innerHTML = `
      <header class="header">
        <div class="header-left">
          <img src="../icons/icon_128.png" alt="InstaBits" class="app-icon">
          <div class="header-text">
            <h1>InstaBits</h1>
            <p>Manage your Instagram features</p>
          </div>
        </div>
        <div class="header-right">
          <button class="icon-btn" data-action="panic" title="Panic Mode">
            ${getIcon('panic')}
          </button>
          <button class="icon-btn" data-action="rate" title="Rate Extension">
            ${getIcon('star-rating')}
          </button>
          <button class="icon-btn" data-action="feedback" title="Feedback">
            ${getIcon('feedback')}
          </button>
          <button class="icon-btn" data-action="settings" title="Settings">
            ${getIcon('settings')}
          </button>
        </div>
      </header>
    `;
  }

  private renderSearchBar(): void {
    const container = document.getElementById('searchBarContainer')!;
    const labels = [
      { text: 'New', color: '#10b981' },
      { text: 'Beta', color: '#3b82f6' },
      { text: 'Experimental', color: '#f59e0b' },
    ];

    container.innerHTML = `
      <div class="search-filter-wrapper">
        <div class="search-container">
          ${getIcon('search')}
          <input type="text" id="searchInput" class="search-input" placeholder="Search features...">
        </div>
        <button class="filter-btn" id="filterBtn" title="Filter by labels">
          ${getIcon('filter')}
          <span class="filter-text">Filter</span>
          <span class="filter-count" id="filterCount" style="display: none;"></span>
        </button>
        <div class="filter-dropdown" id="filterDropdown" style="display: none;">
          <div class="filter-dropdown-header">
            <h4>Filter by Labels</h4>
            <button class="filter-clear" id="filterClear">Clear All</button>
          </div>
          <div class="filter-dropdown-content">
            ${labels.map(label => `
              <label class="filter-option">
                <input type="checkbox" class="filter-checkbox" data-label="${label.text}">
                <span class="filter-option-content">
                  <span class="badge" style="background-color: ${label.color}; color: white;">${label.text}</span>
                  <span class="filter-option-count" data-label-count="${label.text}">0</span>
                </span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private renderFeatures(): void {
    const container = document.getElementById('featuresGrid')!;

    container.innerHTML = SECTIONS.map(section => {
      const sectionFeatures = this.featuresData.filter(f => section.features.includes(f.id));

      return `
        <div class="features-section" data-section="${section.id}">
          <h2 class="section-title">${section.name}</h2>
          <div class="features-grid">
            ${sectionFeatures.map(feature => this.renderFeatureCard(feature)).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  private renderFeatureCard(feature: FeatureData): string {
    const badgesHtml = feature.badges && feature.badges.length > 0
      ? `<div class="feature-badges">
           ${feature.badges.map(badge =>
             `<span class="badge" style="background-color: ${badge.color}; color: white;">${badge.text}</span>`
           ).join('')}
         </div>`
      : '';

    const toggleHtml = feature.toggleable !== false
      ? `<label class="toggle">
           <input type="checkbox" data-feature="${feature.id}">
           <span class="toggle-slider"></span>
         </label>`
      : '';

    const configHtml = feature.configButton
      ? `<a href="#" class="feature-link ${feature.disabled ? 'disabled' : ''}" data-page="${feature.configButton.page || ''}">
           ${feature.configButton.text || 'Configure'}
           ${getIcon(feature.configButton.icon || 'arrow')}
         </a>`
      : '';

    return `
      <div class="feature-card" data-feature-name="${feature.searchName || feature.name.toLowerCase()}" data-feature-id="${feature.id}">
        <div class="feature-icon" style="background: ${feature.icon.background}; color: ${feature.icon.color || 'white'};">
          ${getIcon(feature.icon.name)}
        </div>
        <div class="feature-content">
          <div class="feature-header">
            <h3>${feature.name}</h3>
            ${toggleHtml}
          </div>
          <p class="feature-description">${feature.description}</p>
          ${badgesHtml}
          <div class="feature-footer">
            ${configHtml}
          </div>
        </div>
      </div>
    `;
  }

  private renderNoResults(): void {
    const container = document.getElementById('noResultsContainer')!;
    container.innerHTML = `
      <div id="noResults" class="no-results" style="display: none;">
        ${getIcon('no-results')}
        <h3>No features found</h3>
        <p>Try searching with different keywords</p>
      </div>
    `;
  }

  private async loadFeatureStates(): Promise<void> {
    const featureIds = this.featuresData.map(f => f.id);

    const states = await chrome.storage.sync.get(
      featureIds.map(id => `instabits_feature_${id}`)
    );

    featureIds.forEach(id => {
      const key = `instabits_feature_${id}`;
      const enabled = states[key] !== false; // Default to true
      const checkbox = document.querySelector<HTMLInputElement>(`input[data-feature="${id}"]`);
      if (checkbox) {
        checkbox.checked = enabled;
      }
    });
  }

  private setupEventListeners(): void {
    // Search
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    searchInput?.addEventListener('input', () => this.handleSearch());

    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    filterBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = filterDropdown!.style.display === 'block';
      filterDropdown!.style.display = isVisible ? 'none' : 'block';
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (filterDropdown && !filterBtn?.contains(e.target as Node) && !filterDropdown.contains(e.target as Node)) {
        filterDropdown.style.display = 'none';
      }
    });

    // Filter checkboxes
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const label = target.dataset.label!;

        if (target.checked) {
          this.activeFilters.add(label);
        } else {
          this.activeFilters.delete(label);
        }

        this.updateFilterCount();
        this.handleSearch();
      });
    });

    // Clear filters
    const filterClear = document.getElementById('filterClear');
    filterClear?.addEventListener('click', () => {
      this.activeFilters.clear();
      document.querySelectorAll<HTMLInputElement>('.filter-checkbox').forEach(cb => {
        cb.checked = false;
      });
      this.updateFilterCount();
      this.handleSearch();
    });

    // Feature toggles
    document.querySelectorAll<HTMLInputElement>('input[data-feature]').forEach(toggle => {
      toggle.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        const featureId = target.dataset.feature!;
        await this.toggleFeature(featureId, target.checked);
      });
    });

    // Header actions
    document.querySelector('[data-action="panic"]')?.addEventListener('click', () => {
      this.showToast({
        title: 'Panic Mode',
        message: 'This feature is coming soon!',
        type: 'info',
      });
    });

    document.querySelector('[data-action="rate"]')?.addEventListener('click', () => {
      window.open('https://chrome.google.com/webstore', '_blank');
    });

    document.querySelector('[data-action="feedback"]')?.addEventListener('click', () => {
      this.showToast({
        title: 'Feedback',
        message: 'Feedback form coming soon!',
        type: 'info',
      });
    });

    document.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
      this.showToast({
        title: 'Settings',
        message: 'Settings page coming soon!',
        type: 'info',
      });
    });
  }

  private handleSearch(): void {
    const searchTerm = (document.getElementById('searchInput') as HTMLInputElement).value.toLowerCase();
    const cards = document.querySelectorAll('.feature-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const cardEl = card as HTMLElement;
      const featureName = cardEl.dataset.featureName || '';
      const featureId = cardEl.dataset.featureId || '';

      // Find the feature data
      const feature = this.featuresData.find(f => f.id === featureId);

      // Check search match
      const matchesSearch = !searchTerm || featureName.includes(searchTerm);

      // Check filter match
      let matchesFilter = true;
      if (this.activeFilters.size > 0 && feature) {
        matchesFilter = feature.badges
          ? feature.badges.some(badge => this.activeFilters.has(badge.text))
          : false;
      }

      // Show/hide card
      if (matchesSearch && matchesFilter) {
        cardEl.classList.remove('hidden');
        visibleCount++;
      } else {
        cardEl.classList.add('hidden');
      }
    });

    // Show/hide no results
    const noResults = document.getElementById('noResults');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // Hide empty sections
    document.querySelectorAll('.features-section').forEach(section => {
      const visibleCards = section.querySelectorAll('.feature-card:not(.hidden)').length;
      (section as HTMLElement).style.display = visibleCards > 0 ? 'block' : 'none';
    });
  }

  private updateFilterCount(): void {
    const filterCount = document.getElementById('filterCount')!;
    const filterBtn = document.getElementById('filterBtn')!;

    if (this.activeFilters.size > 0) {
      filterCount.textContent = this.activeFilters.size.toString();
      filterCount.style.display = 'inline-flex';
      filterBtn.classList.add('filter-active');
    } else {
      filterCount.style.display = 'none';
      filterBtn.classList.remove('filter-active');
    }
  }

  private async toggleFeature(featureId: string, enabled: boolean): Promise<void> {
    try {
      await chrome.storage.sync.set({ [`instabits_feature_${featureId}`]: enabled });

      const feature = this.featuresData.find(f => f.id === featureId);
      this.showToast({
        title: enabled ? 'Feature Enabled' : 'Feature Disabled',
        message: `${feature?.name || featureId} has been ${enabled ? 'enabled' : 'disabled'}`,
        type: 'success',
      });

      // Reload Instagram tabs
      const tabs = await chrome.tabs.query({ url: 'https://*.instagram.com/*' });
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.reload(tab.id);
        }
      });
    } catch (error) {
      console.error('Error toggling feature:', error);
      this.showToast({
        title: 'Error',
        message: 'Failed to toggle feature',
        type: 'error',
      });
    }
  }

  private showToast(options: ToastOptions): void {
    const toast = document.getElementById('toast')!;
    const { title, message, type = 'info', duration = 3000 } = options;

    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-text">
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
        </div>
      </div>
    `;

    toast.className = `toast toast-${type} toast-show`;

    setTimeout(() => {
      toast.classList.remove('toast-show');
    }, duration);
  }
}

// Initialize dashboard
new Dashboard();
