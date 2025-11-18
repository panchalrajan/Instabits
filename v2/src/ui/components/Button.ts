/**
 * Button Component
 * Reusable button UI component
 */

export interface ButtonOptions {
  text?: string;
  icon?: string;
  title?: string;
  onClick?: (event: MouseEvent) => void;
  className?: string;
  styles?: Partial<CSSStyleDeclaration>;
}

export class Button {
  private element: HTMLButtonElement;

  constructor(options: ButtonOptions) {
    this.element = this.createElement(options);
  }

  private createElement(options: ButtonOptions): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = `instabits-btn ${options.className || ''}`;

    if (options.text) {
      button.textContent = options.text;
    }

    if (options.icon) {
      button.innerHTML = options.icon;
    }

    if (options.title) {
      button.title = options.title;
    }

    if (options.onClick) {
      button.addEventListener('click', options.onClick);
    }

    // Default styles
    Object.assign(button.style, {
      padding: '6px 10px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...options.styles,
    });

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    });

    return button;
  }

  getElement(): HTMLButtonElement {
    return this.element;
  }

  setText(text: string): void {
    this.element.textContent = text;
  }

  setIcon(icon: string): void {
    this.element.innerHTML = icon;
  }

  setDisabled(disabled: boolean): void {
    this.element.disabled = disabled;
    this.element.style.opacity = disabled ? '0.5' : '1';
    this.element.style.cursor = disabled ? 'not-allowed' : 'pointer';
  }

  destroy(): void {
    this.element.remove();
  }
}
