/**
 * Custom Tooltip System
 * Inspired by: https://codepen.io/HansCz/pen/rMKzVw
 * Lightweight, CSS-based tooltips with JavaScript positioning
 */

class TooltipManager {
    constructor() {
        this.activeTooltip = null;
        this.showTimeout = null;
        this.hideTimeout = null;
        this.currentTarget = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTooltips());
        } else {
            this.setupTooltips();
        }
    }

    setupTooltips() {
        // Find all elements with data-tooltip attribute
        this.updateTooltips();

        // Re-scan for tooltips when DOM changes (for dynamic content)
        const observer = new MutationObserver(() => this.updateTooltips());
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    updateTooltips() {
        const elements = document.querySelectorAll('[data-tooltip]');

        elements.forEach(element => {
            // Skip if already initialized
            if (element.hasAttribute('data-tooltip-initialized')) return;

            element.setAttribute('data-tooltip-initialized', 'true');

            // Add event listeners
            element.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
            element.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        });
    }

    handleMouseEnter(event) {
        const element = event.currentTarget;

        // Clear any pending hide timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        // If already showing tooltip for this element, don't recreate
        if (this.currentTarget === element && this.activeTooltip) {
            return;
        }

        // Clear any pending show timeout
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
        }

        // Show tooltip after delay (like the reference)
        this.showTimeout = setTimeout(() => {
            this.showTooltip(element);
        }, 300); // 300ms delay before showing
    }

    handleMouseLeave(event) {
        const element = event.currentTarget;

        // Clear any pending show timeout
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }

        // Hide tooltip after a short delay
        this.hideTimeout = setTimeout(() => {
            this.hideTooltip();
        }, 100);
    }

    showTooltip(element) {
        const text = element.getAttribute('data-tooltip');
        const position = element.getAttribute('data-tooltip-position') || 'top';

        if (!text) return;

        // Remove existing tooltip if any
        if (this.activeTooltip) {
            this.removeTooltip();
        }

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = `custom-tooltip ${position}`;
        tooltip.textContent = text;

        // Add to body
        document.body.appendChild(tooltip);
        this.activeTooltip = tooltip;
        this.currentTarget = element;

        // Position tooltip
        this.positionTooltip(element, tooltip, position);

        // Show with animation
        requestAnimationFrame(() => {
            tooltip.classList.add('visible');
        });
    }

    hideTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.classList.remove('visible');

            // Remove after animation completes
            setTimeout(() => {
                this.removeTooltip();
            }, 150);
        }

        this.currentTarget = null;
    }

    removeTooltip() {
        if (this.activeTooltip && this.activeTooltip.parentNode) {
            this.activeTooltip.parentNode.removeChild(this.activeTooltip);
        }
        this.activeTooltip = null;
    }

    positionTooltip(element, tooltip, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const offset = 10;

        let top, left;

        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - offset;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;

            case 'bottom':
                top = rect.bottom + offset;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;

            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - offset;
                break;

            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + offset;
                break;

            default:
                top = rect.top - tooltipRect.height - offset;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
        }

        // Keep tooltip within viewport
        const padding = 10;
        const maxLeft = window.innerWidth - tooltipRect.width - padding;
        const maxTop = window.innerHeight - tooltipRect.height - padding;

        left = Math.max(padding, Math.min(left, maxLeft));
        top = Math.max(padding, Math.min(top, maxTop));

        // Apply position
        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
    }
}

// Initialize tooltip manager
const tooltipManager = new TooltipManager();
