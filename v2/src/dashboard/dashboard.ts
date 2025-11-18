/**
 * Dashboard Script
 * Settings and feature management UI
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
  enabled: boolean;
}

const FEATURES: Omit<FeatureInfo, 'enabled'>[] = [
  {
    id: 'fullscreen',
    name: 'Fullscreen',
    description: 'Quick fullscreen button for videos',
  },
  {
    id: 'playbackSpeed',
    name: 'Playback Speed',
    description: 'Control video playback speed (0.25x - 3x)',
  },
  {
    id: 'pipMode',
    name: 'Picture-in-Picture',
    description: 'Watch videos in a floating window',
  },
  {
    id: 'videoDuration',
    name: 'Video Duration',
    description: 'Display current time and total duration',
  },
  {
    id: 'videoSeekbar',
    name: 'Video Seekbar',
    description: 'Interactive progress bar for seeking',
  },
  {
    id: 'volumeControl',
    name: 'Volume Control',
    description: 'Control video volume with a slider',
  },
  {
    id: 'zenMode',
    name: 'Zen Mode',
    description: 'Hide UI overlays for distraction-free viewing',
  },
  {
    id: 'backgroundPlay',
    name: 'Background Play',
    description: 'Continue playback when tab is hidden',
  },
  {
    id: 'autoScroll',
    name: 'Auto Scroll',
    description: 'Automatically scroll to next reel when current ends',
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
    const keys = FEATURES.map((f) => getFeatureStorageKey(f.id));
    const states = await this.storage.get<boolean>(keys);

    this.features = FEATURES.map((feature) => ({
      ...feature,
      enabled: states[getFeatureStorageKey(feature.id)] ?? true,
    }));
  }

  private render(): void {
    const container = document.getElementById('features-container');
    if (!container) return;

    container.innerHTML = '';

    this.features.forEach((feature) => {
      const card = this.createFeatureCard(feature);
      container.appendChild(card);
    });

    // Update stats
    this.updateStats();
  }

  private updateStats(): void {
    const enabledCount = this.features.filter((f) => f.enabled).length;
    const enabledEl = document.getElementById('enabledFeatures');
    if (enabledEl) {
      enabledEl.textContent = String(enabledCount);
    }
  }

  private createFeatureCard(feature: FeatureInfo): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'feature-card';

    card.innerHTML = `
      <div class="feature-header">
        <h3>${feature.name}</h3>
        <label class="toggle">
          <input type="checkbox" ${feature.enabled ? 'checked' : ''} data-feature-id="${feature.id}">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p class="feature-description">${feature.description}</p>
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

    // Listen to storage changes from other tabs
    this.storage.onChanged((changes) => {
      Object.keys(changes).forEach((key) => {
        if (key.startsWith('instabits_feature_')) {
          this.loadFeatures().then(() => this.render());
        }
      });
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

      this.showToast(
        `${feature?.name || id} ${enabled ? 'enabled' : 'disabled'}`
      );
    } catch (error) {
      this.logger.error('Error toggling feature', error as Error);
      this.showToast('Error updating feature', 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
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
