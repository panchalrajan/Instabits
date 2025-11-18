/**
 * Slider Component
 * Reusable slider UI component
 */

export interface SliderOptions {
  min?: number;
  max?: number;
  value?: number;
  step?: number;
  onChange?: (value: number) => void;
  className?: string;
  vertical?: boolean;
}

export class Slider {
  private container: HTMLDivElement;
  private slider: HTMLInputElement;
  private currentValue: number;
  private onChange?: (value: number) => void;

  constructor(options: SliderOptions) {
    this.currentValue = options.value ?? 50;
    this.onChange = options.onChange;

    this.container = this.createContainer(options.className, options.vertical);
    this.slider = this.createSlider(options);

    this.container.appendChild(this.slider);
  }

  private createContainer(
    className?: string,
    vertical?: boolean
  ): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `instabits-slider ${className || ''}`;

    Object.assign(container.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '6px 10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '4px',
      ...(vertical ? { height: '100px' } : { width: '80px' }),
    });

    return container;
  }

  private createSlider(options: SliderOptions): HTMLInputElement {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = String(options.min ?? 0);
    slider.max = String(options.max ?? 100);
    slider.value = String(this.currentValue);
    slider.step = String(options.step ?? 1);

    Object.assign(slider.style, {
      width: '100%',
      height: options.vertical ? '100%' : '4px',
      cursor: 'pointer',
      appearance: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '2px',
      outline: 'none',
      ...(options.vertical ? { writingMode: 'bt-lr' } : {}),
    });

    // Thumb styling (webkit)
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .instabits-slider input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
      }
      .instabits-slider input[type="range"]::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }
    `;
    document.head.appendChild(styleSheet);

    slider.addEventListener('input', () => {
      this.setValue(Number(slider.value), false);
    });

    return slider;
  }

  setValue(value: number, updateSlider = true): void {
    this.currentValue = value;

    if (updateSlider) {
      this.slider.value = String(value);
    }

    if (this.onChange) {
      this.onChange(value);
    }
  }

  getValue(): number {
    return this.currentValue;
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
