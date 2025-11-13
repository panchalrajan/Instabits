/**
 * Reusable Confirmation Dialog Component
 * Can be used across all dashboard pages
 */

class ConfirmDialog {
    constructor() {
        this.dialog = null;
    }

    /**
     * Show confirmation dialog
     * @param {Object} config - Dialog configuration
     * @param {string} config.title - Dialog title
     * @param {string} config.message - Dialog message
     * @param {string} config.warning - Optional warning text
     * @param {string} config.confirmText - Confirm button text (default: 'Confirm')
     * @param {string} config.cancelText - Cancel button text (default: 'Cancel')
     * @param {Function} config.onConfirm - Callback when confirmed
     * @param {Function} config.onCancel - Callback when cancelled
     */
    show(config) {
        const { title, message, warning, confirmText, cancelText, onConfirm, onCancel } = config;

        // Remove existing dialog if any
        this.remove();

        // Create dialog HTML
        const dialogHTML = `
            <div class="confirm-dialog-overlay">
                <div class="confirm-dialog">
                    <div class="confirm-dialog-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
                            <circle cx="24" cy="24" r="20" stroke-width="2"/>
                            <path d="M24 14v12" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="24" cy="32" r="1.5" fill="currentColor"/>
                        </svg>
                    </div>
                    <h3 class="confirm-dialog-title">${title}</h3>
                    <p class="confirm-dialog-message">${message}</p>
                    ${warning ? `<div class="confirm-dialog-warning">${warning}</div>` : ''}
                    <div class="confirm-dialog-actions">
                        <button class="confirm-dialog-btn confirm-dialog-cancel">${cancelText || 'Cancel'}</button>
                        <button class="confirm-dialog-btn confirm-dialog-ok">${confirmText || 'Confirm'}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        this.dialog = document.querySelector('.confirm-dialog-overlay');

        // Attach event listeners
        const cancelBtn = this.dialog.querySelector('.confirm-dialog-cancel');
        const confirmBtn = this.dialog.querySelector('.confirm-dialog-ok');

        cancelBtn.addEventListener('click', () => {
            this.remove();
            if (onCancel) onCancel();
        });

        confirmBtn.addEventListener('click', () => {
            this.remove();
            if (onConfirm) onConfirm();
        });

        // Close on overlay click
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.remove();
                if (onCancel) onCancel();
            }
        });

        // Show with animation
        requestAnimationFrame(() => {
            if (this.dialog) {
                this.dialog.classList.add('visible');
            }
        });
    }

    /**
     * Remove dialog
     */
    remove() {
        if (this.dialog && this.dialog.parentNode) {
            this.dialog.remove();
            this.dialog = null;
        }
    }
}

// Create global instance for easy access across dashboard
window.confirmDialog = new ConfirmDialog();
