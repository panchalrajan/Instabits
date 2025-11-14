/**
 * Panic Mode Handler
 * Shared across all dashboard pages
 * Checks panic mode status and shows overlay if active
 */

class PanicModeHandler {
    constructor() {
        this.isPanicMode = false;
        this.overlay = null;
    }

    /**
     * Initialize panic mode handler
     * Call this on every dashboard page load
     */
    async init() {
        // Check panic mode status from storage
        await this.checkPanicMode();

        // Create overlay if it doesn't exist
        this.createOverlay();

        // Update UI based on panic mode status
        this.updateUI();

        // Listen for panic mode changes
        this.setupStorageListener();
    }

    /**
     * Check panic mode status from storage
     */
    async checkPanicMode() {
        try {
            this.isPanicMode = await storageService.get('instabits_panic_mode', false);
        } catch (error) {
            console.error('[Panic Mode] Error checking panic mode:', error);
            this.isPanicMode = false;
        }
    }

    /**
     * Create panic mode overlay
     */
    createOverlay() {
        // Check if overlay already exists
        if (document.getElementById('panicModeOverlay')) {
            this.overlay = document.getElementById('panicModeOverlay');
            return;
        }

        // Create overlay HTML
        const overlayHTML = `
            <div id="panicModeOverlay" class="panic-mode-overlay" style="display: none;">
                <div class="panic-mode-content">
                    <div class="panic-mode-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor">
                            <circle cx="32" cy="32" r="28" stroke-width="3"/>
                            <path d="M32 16v16" stroke-width="3" stroke-linecap="round"/>
                            <circle cx="32" cy="44" r="2" fill="currentColor"/>
                        </svg>
                    </div>
                    <h2>Panic Mode Enabled</h2>
                    <p>The extension is temporarily disabled. All features remain unchanged and will be restored when you disable Panic Mode.</p>
                    <div class="panic-mode-warning">
                        ⚠️ Disabling Panic Mode will reload all Instagram tabs
                    </div>
                    <button class="panic-mode-disable-btn" id="disablePanicMode">
                        Disable Panic Mode
                    </button>
                </div>
            </div>
        `;

        // Add overlay to body
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        this.overlay = document.getElementById('panicModeOverlay');

        // Add click handler for disable button
        const disableBtn = document.getElementById('disablePanicMode');
        if (disableBtn) {
            disableBtn.addEventListener('click', () => this.disablePanicMode());
        }
    }

    /**
     * Update UI based on panic mode status
     */
    updateUI() {
        // Show/hide overlay
        if (this.overlay) {
            this.overlay.style.display = this.isPanicMode ? 'flex' : 'none';
        }

        // Update body class to prevent interactions
        if (this.isPanicMode) {
            document.body.classList.add('panic-mode-active');
        } else {
            document.body.classList.remove('panic-mode-active');
        }

        // Update panic button if it exists (on main dashboard)
        const panicBtn = document.querySelector('[data-action="panic"]');
        if (panicBtn) {
            if (this.isPanicMode) {
                panicBtn.classList.add('panic-active');
            } else {
                panicBtn.classList.remove('panic-active');
            }
        }
    }

    /**
     * Enable panic mode
     * Note: This will reload all Instagram tabs
     */
    async enablePanicMode() {
        try {
            const success = await storageService.set('instabits_panic_mode', true);
            if (!success) {
                console.error('[Panic Mode] Error enabling panic mode');
                return false;
            }

            // Don't call updateUI() here - we're reloading the page anyway
            // This prevents showing the panic overlay twice

            // Reload all Instagram tabs (which will reload this dashboard too)
            this.reloadAllInstagramTabs();

            return true;
        } catch (error) {
            console.error('[Panic Mode] Error enabling:', error);
            return false;
        }
    }

    /**
     * Disable panic mode
     * Note: This will reload all Instagram tabs to re-initialize features cleanly
     */
    async disablePanicMode() {
        try {
            const success = await storageService.set('instabits_panic_mode', false);
            if (!success) {
                console.error('[Panic Mode] Error disabling panic mode');
                return false;
            }

            // Show loading message before reload
            if (this.overlay) {
                const content = this.overlay.querySelector('.panic-mode-content');
                if (content) {
                    content.innerHTML = `
                        <div class="panic-mode-icon">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor">
                                <circle cx="32" cy="32" r="28" stroke-width="3"/>
                                <path d="M32 16v16" stroke-width="3" stroke-linecap="round"/>
                                <circle cx="32" cy="44" r="2" fill="currentColor"/>
                            </svg>
                        </div>
                        <h2>Reloading...</h2>
                        <p>Panic Mode disabled. Reloading all Instagram tabs...</p>
                    `;
                }
            }

            // Reload all Instagram tabs
            this.reloadAllInstagramTabs();

            return true;
        } catch (error) {
            console.error('[Panic Mode] Error disabling:', error);
            return false;
        }
    }

    /**
     * Reload all Instagram tabs
     */
    async reloadAllInstagramTabs() {
        try {
            // Query all tabs with Instagram URL
            const tabs = await chrome.tabs.query({ url: '*://*.instagram.com/*' });

            // Reload each Instagram tab
            tabs.forEach(tab => {
                chrome.tabs.reload(tab.id);
            });

            // Also reload current page if it's a dashboard page
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error('[Panic Mode] Error reloading Instagram tabs:', error);
            // Fallback: just reload current page
            window.location.reload();
        }
    }

    /**
     * Toggle panic mode with confirmation
     */
    async togglePanicMode() {
        if (this.isPanicMode) {
            // Disabling panic mode - show confirmation
            window.confirmDialog.show({
                title: 'Disable Panic Mode?',
                message: 'This will re-enable all extension features.',
                warning: '⚠️ All Instagram tabs will be reloaded',
                confirmText: 'Disable',
                cancelText: 'Cancel',
                onConfirm: () => {
                    this.disablePanicMode();
                }
            });
        } else {
            // Enabling panic mode - show confirmation
            window.confirmDialog.show({
                title: 'Enable Panic Mode?',
                message: 'This will temporarily disable all extension features. Your settings will remain unchanged.',
                warning: '⚠️ All Instagram tabs will be reloaded',
                confirmText: 'Enable',
                cancelText: 'Cancel',
                onConfirm: () => {
                    this.enablePanicMode();
                }
            });
        }
    }

    /**
     * Setup storage listener to detect panic mode changes from other pages
     */
    setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'sync') return;

            if (changes.instabits_panic_mode) {
                const newValue = changes.instabits_panic_mode.newValue === true;
                const oldValue = this.isPanicMode;

                // If panic mode was just enabled or disabled, reload all Instagram tabs
                // Don't update UI here because we're reloading the page anyway
                if (oldValue !== newValue) {
                    // Check if we're on an Instagram page
                    if (window.location.hostname.includes('instagram.com')) {
                        // Just reload this Instagram tab
                        window.location.reload();
                    } else {
                        // We're on dashboard, reload all Instagram tabs and current page
                        this.reloadAllInstagramTabs();
                    }
                    return;
                }
            }
        });
    }
}

// Create global instance
const panicModeHandler = new PanicModeHandler();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => panicModeHandler.init());
} else {
    panicModeHandler.init();
}
