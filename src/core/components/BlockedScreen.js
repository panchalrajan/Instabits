/**
 * BlockedScreen Component
 *
 * Reusable component for creating full-screen blocked/info screens
 * Used across features to show blocking messages with customizable content
 */
class BlockedScreen {
  /**
   * Icon library for blocked screens
   */
  static icons = {
    'message-circle-off': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 100%; height: 100%;">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="2" y1="2" x2="22" y2="22" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    'block': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 100%; height: 100%;">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    'info': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 100%; height: 100%;">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
      <line x1="12" y1="16" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  };

  /**
   * Get icon SVG by name
   * @param {string} iconName - Icon identifier
   * @returns {string} SVG markup
   */
  static getIcon(iconName) {
    return this.icons[iconName] || this.icons['block'];
  }

  /**
   * Create a blocked screen element
   * @param {Object} options - Configuration options
   * @param {string} options.title - Screen title
   * @param {string} options.subtitle - Screen subtitle/description
   * @param {string} options.ctaText - Call-to-action button text
   * @param {string} options.ctaLink - Call-to-action button link
   * @param {string} options.iconName - Icon name from BlockedScreen.icons
   * @param {string} [options.id] - Optional custom ID for the screen element
   * @returns {HTMLElement} The blocked screen element
   */
  static create({ title, subtitle, ctaText, ctaLink, iconName, id = 'instabits-blocked-screen' }) {
    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'instabits-blocked-screen';

    const iconSvg = this.getIcon(iconName);

    screen.innerHTML = `
      <div class="instabits-blocked-screen__container">
        <div class="instabits-blocked-screen__icon">
          ${iconSvg}
        </div>
        <h2 class="instabits-blocked-screen__title">${title}</h2>
        <p class="instabits-blocked-screen__subtitle">${subtitle}</p>
        <a href="${ctaLink}" class="instabits-blocked-screen__cta">${ctaText}</a>
        <p class="instabits-blocked-screen__branding">Powered by Instabits</p>
      </div>
    `;

    return screen;
  }

  /**
   * Remove a blocked screen from the DOM
   * @param {string} id - ID of the screen to remove
   */
  static remove(id = 'instabits-blocked-screen') {
    const screen = document.getElementById(id);
    if (screen && screen.parentNode) {
      screen.parentNode.removeChild(screen);
    }
  }

  /**
   * Check if a blocked screen exists
   * @param {string} id - ID of the screen to check
   * @returns {boolean} Whether the screen exists
   */
  static exists(id = 'instabits-blocked-screen') {
    return document.getElementById(id) !== null;
  }
}
