/**
 * Toast - Shared toast notification component
 * Used across dashboard and settings pages
 */
class Toast {
    constructor(toastElementId = 'toast') {
        this.toast = document.getElementById(toastElementId);
        this.toastTimeout = null;
    }

    /**
     * Show toast notification
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     */
    show(title, message, type = 'info') {
        if (!this.toast) return;

        // Clear any existing timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        // Remove existing toast immediately if showing
        if (this.toast.classList.contains('show')) {
            this.toast.classList.remove('show');

            // Wait for slide out animation before showing new toast
            setTimeout(() => {
                this.display(title, message, type);
            }, 200);
        } else {
            this.display(title, message, type);
        }
    }

    /**
     * Display the toast
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     */
    display(title, message, type) {
        // Remove all type classes
        this.toast.className = 'toast';

        // Add the appropriate type class
        this.toast.classList.add(`toast-${type}`);

        // Generate toast HTML
        this.toast.innerHTML = this.getToastHTML(title, message, type);

        // Show toast with animation
        requestAnimationFrame(() => {
            this.toast.classList.add('show');
        });

        // Auto hide after 3 seconds
        this.toastTimeout = setTimeout(() => {
            this.hide();
        }, 3000);
    }

    /**
     * Hide toast
     */
    hide() {
        if (this.toast) {
            this.toast.classList.remove('show');
        }
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
    }

    /**
     * Get toast HTML
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @returns {string} HTML string
     */
    getToastHTML(title, message, type) {
        const icons = {
            success: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            error: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M10 6v4m0 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            warning: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M10 6v4m0 4h.01M10 2l8 14H2L10 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            info: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M10 11v5m0-10h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        };

        return `
            <div class="toast-content">
                <div class="toast-icon">
                    ${icons[type]}
                </div>
                <div class="toast-details">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" onclick="this.closest('.toast').classList.remove('show')">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor">
                        <path d="M12 4L4 12M4 4l8 8" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `;
    }
}
