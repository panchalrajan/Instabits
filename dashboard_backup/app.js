// ============================================
// STATE MANAGEMENT
// ============================================

const FEATURES_DATA = [
  {
    id: 'video-duration',
    name: 'Video Duration',
    description: 'Display current time and total duration overlay on Instagram videos with customizable positioning',
    category: 'video',
    enabled: true,
    tags: [],
    hasSettings: true,
    settings: {
      position: { type: 'select', label: 'Position', value: 'bottom-center', options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] },
      fontSize: { type: 'select', label: 'Font Size', value: 'medium', options: ['small', 'medium', 'large'] }
    }
  },
  {
    id: 'video-seekbar',
    name: 'Video Seekbar',
    description: 'Interactive seekbar with smooth 60fps updates for precise video navigation',
    category: 'video',
    enabled: true,
    tags: [],
    hasSettings: true,
    settings: {
      height: { type: 'range', label: 'Height (px)', value: 4, min: 2, max: 10 },
      color: { type: 'color', label: 'Color', value: '#6366f1' }
    }
  },
  {
    id: 'volume-control',
    name: 'Volume Control',
    description: 'Vertical volume slider with hover-to-expand functionality and persistent volume memory',
    category: 'video',
    enabled: true,
    tags: [],
    hasSettings: true,
    settings: {
      position: { type: 'select', label: 'Position', value: 'right', options: ['left', 'right'] }
    }
  },
  {
    id: 'playback-speed',
    name: 'Playback Speed',
    description: 'Adjust video playback speed from 0.25x to 3x with session-based persistence',
    category: 'video',
    enabled: true,
    tags: ['new'],
    hasSettings: true,
    settings: {
      defaultSpeed: { type: 'select', label: 'Default Speed', value: '1.0', options: ['0.25', '0.5', '0.75', '1.0', '1.25', '1.5', '2.0', '3.0'] }
    }
  },
  {
    id: 'background-play',
    name: 'Background Play',
    description: 'Continue playing videos when switching tabs or minimizing the browser window',
    category: 'video',
    enabled: true,
    tags: [],
    hasSettings: false
  },
  {
    id: 'auto-scroll',
    name: 'Auto Scroll',
    description: 'Automatically scroll to the next reel when the current video ends on the reels page',
    category: 'automation',
    enabled: true,
    tags: ['beta'],
    hasSettings: true,
    settings: {
      delay: { type: 'range', label: 'Delay (ms)', value: 300, min: 0, max: 2000 }
    }
  },
  {
    id: 'picture-in-picture',
    name: 'Picture in Picture',
    description: 'Watch videos in a floating window while browsing other content across tabs',
    category: 'video',
    enabled: false,
    tags: ['coming-soon'],
    hasSettings: true,
    settings: {
      autoEnable: { type: 'checkbox', label: 'Auto-enable on tab switch', value: false }
    }
  },
  {
    id: 'download-videos',
    name: 'Download Videos',
    description: 'One-click download for Instagram reels and videos in your preferred quality',
    category: 'ui',
    enabled: false,
    tags: ['coming-soon'],
    hasSettings: true,
    settings: {
      quality: { type: 'select', label: 'Quality', value: 'high', options: ['low', 'medium', 'high', 'original'] }
    }
  },
  {
    id: 'hide-ui-elements',
    name: 'Hide UI Elements',
    description: 'Clean viewing experience by hiding distracting UI elements like comments and suggestions',
    category: 'ui',
    enabled: false,
    tags: [],
    hasSettings: true,
    settings: {
      hideComments: { type: 'checkbox', label: 'Hide comments', value: true },
      hideSuggestions: { type: 'checkbox', label: 'Hide suggested profiles', value: true }
    }
  },
  {
    id: 'keyboard-shortcuts',
    name: 'Keyboard Shortcuts',
    description: 'Navigate and control videos using customizable keyboard shortcuts for faster interaction',
    category: 'ui',
    enabled: false,
    tags: ['coming-soon'],
    hasSettings: true,
    settings: {
      spaceToPlay: { type: 'checkbox', label: 'Space to play/pause', value: true },
      arrowsSeek: { type: 'checkbox', label: 'Arrows to seek', value: true }
    }
  },
  {
    id: 'dark-theme',
    name: 'Force Dark Theme',
    description: 'Apply a consistent dark theme across all Instagram pages for comfortable viewing',
    category: 'ui',
    enabled: false,
    tags: [],
    hasSettings: false
  },
  {
    id: 'auto-like',
    name: 'Auto Like',
    description: 'Automatically like posts from specific accounts you follow',
    category: 'automation',
    enabled: false,
    tags: ['coming-soon'],
    hasSettings: true,
    settings: {
      accounts: { type: 'textarea', label: 'Accounts (one per line)', value: '' }
    }
  }
];

let features = JSON.parse(localStorage.getItem('instabits-features')) || [...FEATURES_DATA];
let filteredFeatures = [...features];
let currentCategory = 'all';
let currentFeature = null;

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.toggle('dark', theme === 'dark');
  updateThemeUI();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeUI();
  showToast('success', 'Theme Changed', `Switched to ${isDark ? 'dark' : 'light'} mode`);
}

function updateThemeUI() {
  const isDark = document.documentElement.classList.contains('dark');
  document.getElementById('themeLabel').textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function getFeatureIcon(category) {
  const icons = {
    video: '<rect x="2" y="4" width="10" height="10" rx="1" stroke="white" stroke-width="1.5" fill="none"/><path d="M12 7l4-2v8l-4-2" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    ui: '<path d="M2 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5z" stroke="white" stroke-width="1.5" fill="none"/><path d="M6 9h6M9 6v6" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
    automation: '<path d="M9 2v4m0 4v6M3 8l2 2 2-2m8 0l-2-2-2 2" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
  };
  return icons[category] || icons.video;
}

function renderFeatureCard(feature) {
  const tagsHTML = feature.tags.map(tag =>
    `<span class="tag ${tag.toLowerCase()}">${tag}</span>`
  ).join('');

  return `
    <div class="feature-card ${feature.enabled ? '' : 'disabled'}">
      <div class="feature-header">
        <div class="feature-icon">
          <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
            ${getFeatureIcon(feature.category)}
          </svg>
        </div>
      </div>
      <div class="feature-content">
        <h3 class="feature-title">${feature.name}</h3>
        <p class="feature-description">${feature.description}</p>
        <div class="feature-tags">${tagsHTML}</div>
      </div>
      <div class="feature-footer">
        <div class="feature-actions">
          ${feature.hasSettings ? `
            <button class="icon-btn settings-btn" data-feature-id="${feature.id}" title="Settings">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 1v2m0 10v2M1 8h2m10 0h2m-2.636-4.364L11.95 4.05m-7.9 7.9l-1.414 1.414m11.314 0L12.536 11.95m-7.9-7.9L3.222 2.636" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="toggle ${feature.enabled ? 'active' : ''}" data-feature-id="${feature.id}">
          <div class="toggle-thumb"></div>
        </div>
      </div>
    </div>
  `;
}

function renderFeatures() {
  const content = document.getElementById('content');

  if (filteredFeatures.length === 0) {
    content.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: rgb(var(--muted-foreground));">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin: 0 auto 20px;">
          <path d="M32 40a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" stroke="currentColor" stroke-width="2"/>
          <path d="M32 4v8m0 40v8M4 32h8m40 0h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No features found</h3>
        <p style="font-size: 14px;">Try adjusting your search or filter</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `<div class="features-grid">${filteredFeatures.map(renderFeatureCard).join('')}</div>`;

  // Add event listeners using delegation
  content.querySelectorAll('.settings-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSettings(btn.dataset.featureId);
    });
  });

  content.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFeature(toggle.dataset.featureId);
    });
  });
}

// ============================================
// FEATURE ACTIONS
// ============================================

function toggleFeature(featureId) {
  const feature = features.find(f => f.id === featureId);
  if (!feature) return;

  feature.enabled = !feature.enabled;
  saveFeatures();
  filterFeatures();

  showToast(
    'success',
    feature.enabled ? 'Feature Enabled' : 'Feature Disabled',
    `${feature.name} is now ${feature.enabled ? 'active' : 'inactive'}`
  );
}

function saveFeatures() {
  localStorage.setItem('instabits-features', JSON.stringify(features));
  // In production: chrome.storage.sync.set({ features });
}

// ============================================
// MODAL MANAGEMENT
// ============================================

function openSettings(featureId) {
  const feature = features.find(f => f.id === featureId);
  if (!feature || !feature.hasSettings) return;

  currentFeature = feature;

  document.getElementById('modalTitle').textContent = feature.name;
  document.getElementById('modalSubtitle').textContent = 'Configure your preferences';
  document.getElementById('modalBody').innerHTML = generateSettingsForm(feature);
  document.getElementById('modal').classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
  document.body.classList.remove('no-scroll');
  currentFeature = null;
}

function saveSettings() {
  if (!currentFeature || !currentFeature.hasSettings) return;

  const form = document.getElementById('settingsForm');
  if (!form) return;

  const formData = new FormData(form);

  Object.keys(currentFeature.settings).forEach(key => {
    const setting = currentFeature.settings[key];

    if (setting.type === 'checkbox') {
      setting.value = formData.get(key) === 'on';
    } else if (setting.type === 'range') {
      setting.value = parseInt(formData.get(key));
    } else {
      setting.value = formData.get(key);
    }
  });

  saveFeatures();
  closeModal();
  showToast('success', 'Settings Saved', `${currentFeature.name} settings updated successfully`);
}

function generateSettingsForm(feature) {
  if (!feature.settings) return '';

  const formHTML = Object.entries(feature.settings).map(([key, setting]) => {
    switch (setting.type) {
      case 'select':
        return `
          <div class="form-group">
            <label class="form-label">${setting.label}</label>
            <select class="form-select" name="${key}">
              ${setting.options.map(opt =>
                `<option value="${opt}" ${setting.value === opt ? 'selected' : ''}>${opt}</option>`
              ).join('')}
            </select>
          </div>
        `;

      case 'range':
        return `
          <div class="form-group">
            <label class="form-label">${setting.label}: <strong id="${key}-value">${setting.value}</strong></label>
            <input
              type="range"
              class="form-input"
              name="${key}"
              value="${setting.value}"
              min="${setting.min}"
              max="${setting.max}"
              oninput="document.getElementById('${key}-value').textContent = this.value"
              style="accent-color: rgb(var(--primary));"
            >
          </div>
        `;

      case 'color':
        return `
          <div class="form-group">
            <label class="form-label">${setting.label}</label>
            <input type="color" class="form-input" name="${key}" value="${setting.value}" style="height: 40px;">
          </div>
        `;

      case 'checkbox':
        return `
          <div class="form-group">
            <label class="form-checkbox-wrapper">
              <input type="checkbox" class="form-checkbox" name="${key}" ${setting.value ? 'checked' : ''}>
              <span>${setting.label}</span>
            </label>
          </div>
        `;

      case 'textarea':
        return `
          <div class="form-group">
            <label class="form-label">${setting.label}</label>
            <textarea class="form-textarea" name="${key}" rows="4">${setting.value}</textarea>
          </div>
        `;

      default:
        return `
          <div class="form-group">
            <label class="form-label">${setting.label}</label>
            <input type="text" class="form-input" name="${key}" value="${setting.value}">
          </div>
        `;
    }
  }).join('');

  return `<form id="settingsForm">${formHTML}</form>`;
}

// ============================================
// FILTER & SEARCH
// ============================================

function filterFeatures() {
  let filtered = [...features];

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(f => f.category === currentCategory);
  }

  // Filter by search
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(searchTerm) ||
      f.description.toLowerCase().includes(searchTerm)
    );
  }

  filteredFeatures = filtered;
  renderFeatures();
  updateCategoryUI();
}

function setCategory(category) {
  currentCategory = category;
  filterFeatures();
}

function updateCategoryUI() {
  const titles = {
    all: 'All Features',
    video: 'Video Controls',
    ui: 'UI & UX',
    automation: 'Automation',
    settings: 'Preferences',
    about: 'About InstaBits'
  };

  document.getElementById('pageTitle').textContent = titles[currentCategory] || 'All Features';

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.category === currentCategory);
  });

  // Update badge counts
  const counts = {
    all: features.length,
    video: features.filter(f => f.category === 'video').length,
    ui: features.filter(f => f.category === 'ui').length,
    automation: features.filter(f => f.category === 'automation').length
  };

  document.querySelectorAll('.nav-item .badge').forEach(badge => {
    const category = badge.closest('.nav-item').dataset.category;
    if (counts[category]) {
      badge.textContent = counts[category];
    }
  });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(type, title, message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>',
    warning: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>',
    error: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>'
  };

  toast.innerHTML = `
    <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24">
      ${icons[type]}
    </svg>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// ============================================
// EXPORT / IMPORT
// ============================================

function exportSettings() {
  const dataStr = JSON.stringify(features, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `instabits-settings-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showToast('success', 'Settings Exported', 'Your settings have been downloaded');
}

function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = JSON.parse(event.target.result);
        features = imported;
        saveFeatures();
        filterFeatures();
        showToast('success', 'Settings Imported', 'Your settings have been restored');
      } catch (error) {
        showToast('error', 'Import Failed', 'Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize
  initTheme();
  renderFeatures();
  updateCategoryUI();

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Search
  document.getElementById('searchInput').addEventListener('input', filterFeatures);

  // Category navigation
  document.querySelectorAll('.nav-item[data-category]').forEach(item => {
    item.addEventListener('click', () => setCategory(item.dataset.category));
  });

  // Modal controls
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalSave').addEventListener('click', saveSettings);
  document.getElementById('modalOverlay').addEventListener('click', closeModal);

  // Header actions
  document.getElementById('exportBtn').addEventListener('click', exportSettings);
  document.getElementById('importBtn').addEventListener('click', importSettings);

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('modal').classList.contains('active')) {
      closeModal();
    }
  });

  // Sidebar toggle for mobile
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
});
