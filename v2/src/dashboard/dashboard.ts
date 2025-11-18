/**
 * Dashboard Script
 * Beautiful, colorful settings and feature management UI
 */

import type { IStorage } from '@app-types';
import { Logger } from '@services/logging/Logger';
import { StorageService } from '@services/storage/StorageService';
import { CacheService } from '@services/storage/CacheService';
import { getFeatureStorageKey } from '@app-types';

interface FeatureInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  badge?: {
    text: string;
    class: string;
  };
  section: 'video' | 'automation';
  enabled: boolean;
}

const FEATURE_CONFIG: Omit<FeatureInfo, 'enabled'>[] = [
  {
    id: 'fullscreen',
    name: 'Fullscreen',
    description: 'Quick fullscreen button for videos with beautiful animations',
    icon: '⛶',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    badge: { text: 'NEW', class: 'badge-new' },
    section: 'video',
  },
  {
    id: 'playbackSpeed',
    name: 'Playback Speed',
    description: 'Control video playback speed from 0.25x to 3x with precision',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    section: 'video',
  },
  {
    id: 'pipMode',
    name: 'Picture-in-Picture',
    description: 'Watch videos in a floating window while browsing',
    icon: '📺',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    badge: { text: 'BETA', class: 'badge-beta' },
    section: 'video',
  },
  {
    id: 'videoDuration',
    name: 'Video Duration',
    description: 'Display current time and total duration overlay',
    icon: '⏱️',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    section: 'video',
  },
  {
    id: 'videoSeekbar',
    name: 'Video Seekbar',
    description: 'Interactive progress bar with click-to-seek functionality',
    icon: '━',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    section: 'video',
  },
  {
    id: 'volumeControl',
    name: 'Volume Control',
    description: 'Control video volume with an intuitive slider',
    icon: '🔊',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    section: 'video',
  },
  {
    id: 'zenMode',
    name: 'Zen Mode',
    description: 'Hide UI overlays for distraction-free viewing experience',
    icon: '🧘',
    gradient: 'linear-gradient(135deg, #a855f7, #9333ea)',
    badge: { text: 'EXPERIMENTAL', class: 'badge-experimental' },
    section: 'video',
  },
  {
    id: 'backgroundPlay',
    name: 'Background Play',
    description: 'Continue playback when tab is hidden or minimized',
    icon: '🎵',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    section: 'video',
  },
  {
    id: 'autoScroll',
    name: 'Auto Scroll',
    description: 'Automatically scroll to next reel when current ends',
    icon: '🔄',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    section: 'automation',
  },
];

class Dashboard {
  private storage: IStorage;
  private logger = Logger.getInstance();
  private features: FeatureInfo[] = [];

  constructor() {
    const cache = new CacheService();
    this.storage = StorageService.getInstance(this.logger, cache);
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing dashboard');

      // Load feature states
      await this.loadFeatures();

      // Render UI
      this.render();

      // Setup event listeners
      this.setupListeners();

      this.logger.info('Dashboard initialized');
    } catch (error) {
      this.logger.error('Dashboard initialization error', error as Error);
    }
  }

  private async loadFeatures(): Promise<void> {
    const keys = FEATURE_CONFIG.map((f) => getFeatureStorageKey(f.id));
    const states = await this.storage.get<boolean>(keys);

    this.features = FEATURE_CONFIG.map((feature) => ({
      ...feature,
      enabled: states[getFeatureStorageKey(feature.id)] ?? true,
    }));
  }

  private render(): void {
    this.renderVideoFeatures();
    this.renderAutomationFeatures();
    this.updateStats();
  }

  private renderVideoFeatures(): void {
    const container = document.getElementById('video-features');
    if (!container) return;

    const videoFeatures = this.features.filter((f) => f.section === 'video');
    container.innerHTML = '';

    videoFeatures.forEach((feature) => {
      const card = this.createFeatureCard(feature);
      container.appendChild(card);
    });

    // Update section count
    const countEl = document.getElementById('videoCount');
    if (countEl) {
      countEl.textContent = `(${videoFeatures.length} features)`;
    }
  }

  private renderAutomationFeatures(): void {
    const container = document.getElementById('automation-features');
    if (!container) return;

    const autoFeatures = this.features.filter((f) => f.section === 'automation');
    container.innerHTML = '';

    autoFeatures.forEach((feature) => {
      const card = this.createFeatureCard(feature);
      container.appendChild(card);
    });

    // Update section count
    const countEl = document.getElementById('autoCount');
    if (countEl) {
      countEl.textContent = `(${autoFeatures.length} feature)`;
    }
  }

  private updateStats(): void {
    const enabledCount = this.features.filter((f) => f.enabled).length;
    const enabledEl = document.getElementById('enabledFeatures');
    if (enabledEl) {
      enabledEl.textContent = String(enabledCount);
    }

    const totalEl = document.getElementById('totalFeatures');
    if (totalEl) {
      totalEl.textContent = String(this.features.length);
    }
  }

  private createFeatureCard(feature: FeatureInfo): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'feature-card';
    card.style.setProperty('--gradient', feature.gradient);

    const badgeHtml = feature.badge
      ? `<span class="feature-badge ${feature.badge.class}">${feature.badge.text}</span>`
      : '';

    card.innerHTML = `
      <div class="feature-header">
        <div class="feature-icon" style="background: ${feature.gradient};">
          ${feature.icon}
        </div>
        <div class="feature-info">
          <div class="feature-title-row">
            <h3 class="feature-title">${feature.name}</h3>
            ${badgeHtml}
          </div>
          <p class="feature-description">${feature.description}</p>
        </div>
      </div>
      <div class="feature-footer">
        <button class="config-btn" data-feature-id="${feature.id}">
          ⚙️ Configure
        </button>
        <label class="toggle">
          <input type="checkbox" ${feature.enabled ? 'checked' : ''} data-feature-id="${feature.id}">
          <span class="toggle-slider"></span>
        </label>
      </div>
    `;

    return card;
  }

  private setupListeners(): void {
    // Feature toggles
    document.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'checkbox' && target.dataset.featureId) {
        const featureId = target.dataset.featureId;
        const enabled = target.checked;

        await this.toggleFeature(featureId, enabled);
      }
    });

    // Config buttons
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('config-btn') || target.closest('.config-btn')) {
        const btn = target.classList.contains('config-btn') ? target : target.closest('.config-btn');
        const featureId = btn?.getAttribute('data-feature-id');
        if (featureId) {
          this.openConfig(featureId);
        }
      }
    });

    // Search
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase();
        this.filterFeatures(query);
      });
    }

    // Listen to storage changes from other tabs
    this.storage.onChanged((changes) => {
      Object.keys(changes).forEach((key) => {
        if (key.startsWith('instabits_feature_')) {
          this.loadFeatures().then(() => this.render());
        }
      });
    });
  }

  private filterFeatures(query: string): void {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card) => {
      const title = card.querySelector('.feature-title')?.textContent?.toLowerCase() || '';
      const description = card.querySelector('.feature-description')?.textContent?.toLowerCase() || '';

      if (title.includes(query) || description.includes(query)) {
        (card as HTMLElement).style.display = '';
      } else {
        (card as HTMLElement).style.display = 'none';
      }
    });
  }

  private async toggleFeature(id: string, enabled: boolean): Promise<void> {
    try {
      this.logger.info(`Toggling feature: ${id} = ${enabled}`);

      const key = getFeatureStorageKey(id);
      await this.storage.set(key, enabled);

      // Update local state
      const feature = this.features.find((f) => f.id === id);
      if (feature) {
        feature.enabled = enabled;
      }

      // Update stats
      this.updateStats();

      this.showToast(
        `${feature?.name || id} ${enabled ? 'enabled' : 'disabled'}`,
        'success'
      );
    } catch (error) {
      this.logger.error('Error toggling feature', error as Error);
      this.showToast('Error updating feature', 'error');
    }
  }

  private openConfig(id: string): void {
    const feature = this.features.find((f) => f.id === id);
    if (feature) {
      this.showToast(`Configuration for ${feature.name} coming soon!`, 'success');
      this.logger.info(`Opening config for: ${id}`);
      // TODO: Implement feature-specific configuration panels
    }
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    dashboard.initialize();
  });
} else {
  const dashboard = new Dashboard();
  dashboard.initialize();
}
