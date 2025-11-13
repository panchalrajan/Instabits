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
        return new Promise((resolve) => {
            chrome.storage.sync.get(['instabits_panic_mode'], (result) => {
                this.isPanicMode = result.instabits_panic_mode === true;
                resolve();
            });
        });
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
     */
    async enablePanicMode() {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ instabits_panic_mode: true }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[Panic Mode] Error enabling:', chrome.runtime.lastError);
                    resolve(false);
                    return;
                }
                this.isPanicMode = true;
                this.updateUI();
                resolve(true);
            });
        });
    }

    /**
     * Disable panic mode
     */
    async disablePanicMode() {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ instabits_panic_mode: false }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[Panic Mode] Error disabling:', chrome.runtime.lastError);
                    resolve(false);
                    return;
                }
                this.isPanicMode = false;
                this.updateUI();
                resolve(true);
            });
        });
    }

    /**
     * Toggle panic mode
     */
    async togglePanicMode() {
        if (this.isPanicMode) {
            return await this.disablePanicMode();
        } else {
            return await this.enablePanicMode();
        }
    }

    /**
     * Setup storage listener to detect panic mode changes from other pages
     */
    setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'sync') return;

            if (changes.instabits_panic_mode) {
                this.isPanicMode = changes.instabits_panic_mode.newValue === true;
                this.updateUI();
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
