/**
 * Dropdown Component
 * Reusable dropdown UI component
 */

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownOptions {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export class Dropdown {
  private container: HTMLDivElement;
  private button: HTMLButtonElement;
  private menu: HTMLDivElement;
  private currentValue: string;
  private options: DropdownOption[];
  private onChange?: (value: string) => void;
  private isOpen = false;

  constructor(options: DropdownOptions) {
    this.options = options.options;
    this.currentValue = options.value || options.options[0]?.value || '';
    this.onChange = options.onChange;

    this.container = this.createContainer(options.className);
    this.button = this.createButton();
    this.menu = this.createMenu();

    this.container.appendChild(this.button);
    this.container.appendChild(this.menu);

    this.updateButtonText();
  }

  private createContainer(className?: string): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `instabits-dropdown ${className || ''}`;

    Object.assign(container.style, {
      position: 'relative',
      display: 'inline-block',
    });

    return container;
  }

  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'instabits-dropdown-btn';

    Object.assign(button.style, {
      padding: '6px 10px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      minWidth: '50px',
      transition: 'background-color 0.2s',
    });

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    });

    return button;
  }

  private createMenu(): HTMLDivElement {
    const menu = document.createElement('div');
    menu.className = 'instabits-dropdown-menu';

    Object.assign(menu.style, {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: '4px',
      padding: '4px 0',
      minWidth: '80px',
      maxHeight: '200px',
      overflowY: 'auto',
      display: 'none',
      zIndex: '10000',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    });

    this.options.forEach((option) => {
      const item = this.createMenuItem(option);
      menu.appendChild(item);
    });

    // Close on click outside
    document.addEventListener('click', () => {
      this.close();
    });

    return menu;
  }

  private createMenuItem(option: DropdownOption): HTMLDivElement {
    const item = document.createElement('div');
    item.className = 'instabits-dropdown-item';
    item.textContent = option.label;

    Object.assign(item.style, {
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      color: 'white',
      transition: 'background-color 0.2s',
    });

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setValue(option.value);
      this.close();
    });

    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });

    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent';
    });

    return item;
  }

  private updateButtonText(): void {
    const option = this.options.find((opt) => opt.value === this.currentValue);
    this.button.textContent = option?.label || this.currentValue;
  }

  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    this.menu.style.display = 'block';
    this.isOpen = true;
  }

  private close(): void {
    this.menu.style.display = 'none';
    this.isOpen = false;
  }

  setValue(value: string): void {
    this.currentValue = value;
    this.updateButtonText();

    if (this.onChange) {
      this.onChange(value);
    }
  }

  getValue(): string {
    return this.currentValue;
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
