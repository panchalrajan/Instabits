/**
 * SettingsHelpers - Utility functions for settings pages
 * Provides reusable helper methods for common UI patterns
 */
class SettingsHelpers {
    /**
     * Create a settings section HTML
     */
    static createSection(title, description, content, className = '') {
        return `
            <div class="settings-section ${className}">
                ${title ? `<h2 class="settings-section-title">${title}</h2>` : ''}
                ${description ? `<p class="settings-section-description">${description}</p>` : ''}
                ${content || ''}
            </div>
        `;
    }

    /**
     * Create a toggle option HTML
     */
    static createToggle(id, title, description, checked = false) {
        return `
            <div class="toggle-option">
                <div class="toggle-info">
                    <div class="toggle-title">${title}</div>
                    ${description ? `<div class="toggle-description">${description}</div>` : ''}
                </div>
                <label class="switch">
                    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
        `;
    }

    /**
     * Create an info box HTML
     */
    static createInfoBox(title, items, icon = null) {
        const itemsList = items.map(item => `<li>${item}</li>`).join('');

        return `
            <div class="info-box">
                ${icon ? `<div class="info-icon">${icon}</div>` : ''}
                ${title ? `<h3 class="info-title">${title}</h3>` : ''}
                <ul class="info-list">
                    ${itemsList}
                </ul>
            </div>
        `;
    }

    /**
     * Create a status item HTML
     */
    static createStatusItem(label, value, type = 'default') {
        const statusClass = type === 'enabled' ? 'status-enabled' : type === 'disabled' ? 'status-disabled' : '';

        return `
            <div class="status-item">
                <span class="status-label">${label}</span>
                <span class="status-value ${statusClass}">${value}</span>
            </div>
        `;
    }

    /**
     * Create a grid container
     */
    static createGrid(items, columns = 'auto') {
        const gridStyle = columns === 'auto' ? '' : `style="grid-template-columns: repeat(${columns}, 1fr);"`;

        return `
            <div class="grid-container" ${gridStyle}>
                ${items.join('')}
            </div>
        `;
    }

    /**
     * Create a divider
     */
    static createDivider() {
        return '<div class="settings-divider"></div>';
    }

    /**
     * Validate and sanitize input
     */
    static sanitizeInput(input) {
        if (typeof input === 'string') {
            return input.replace(/[<>]/g, '');
        }
        return input;
    }

    /**
     * Debounce function for input handlers
     */
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Check if element is visible in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     */
    static scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }
}
