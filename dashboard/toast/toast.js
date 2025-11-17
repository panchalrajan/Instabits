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

        // Attach close button event listener
        const closeButton = this.toast.querySelector('.toast-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hide();
            });
        }

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
        // Use centralized IconLibrary
        const iconName = `toast-${type}`;

        return `
            <div class="toast-content">
                <div class="toast-icon">
                    ${IconLibrary.get(iconName)}
                </div>
                <div class="toast-details">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close">
                    ${IconLibrary.get('toast-close')}
                </button>
            </div>
        `;
    }
}
