/**
 * Dashboard type definitions
 */

export interface FeatureData {
  id: string;
  name: string;
  searchName?: string;
  icon: IconConfig;
  badge?: BadgeConfig;
  description: string;
  category: 'video' | 'automation';
  configButton?: ConfigButtonConfig;
  disabled?: boolean;
  toggleable?: boolean;
}

export interface IconConfig {
  name: string;
  color?: string;
  background?: string;
}

export interface BadgeConfig {
  text: string;
  color: string;
}

export interface ConfigButtonConfig {
  text?: string;
  page?: string;
  icon?: string;
}

export interface Section {
  id: string;
  name: string;
  features: string[];
}

export interface ToastOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
