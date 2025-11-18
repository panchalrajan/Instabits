/**
 * General utility helper functions
 */

/**
 * Format time in MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = 'instabits'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj: any = {};
    Object.keys(obj).forEach((key) => {
      clonedObj[key] = deepClone((obj as any)[key]);
    });
    return clonedObj;
  }

  return obj;
}

/**
 * Check if two objects are equal (shallow comparison)
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts || 3;
  const initialDelay = options?.initialDelay || 1000;
  const maxDelay = options?.maxDelay || 10000;
  const factor = options?.factor || 2;

  let attempt = 0;
  let currentDelay = initialDelay;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt >= maxAttempts) {
        throw error;
      }

      await delay(currentDelay);
      currentDelay = Math.min(currentDelay * factor, maxDelay);
    }
  }

  throw new Error('Retry failed');
}

/**
 * Check if we're on Instagram
 */
export function isInstagram(): boolean {
  return window.location.hostname.includes('instagram.com');
}

/**
 * Check if we're on a specific Instagram page
 */
export function isInstagramPage(page: 'reels' | 'stories' | 'profile' | 'home'): boolean {
  const path = window.location.pathname;

  switch (page) {
    case 'reels':
      return path.includes('/reels/');
    case 'stories':
      return path.includes('/stories/');
    case 'profile':
      return /^\/[a-zA-Z0-9_.]+\/$/.test(path);
    case 'home':
      return path === '/';
    default:
      return false;
  }
}

/**
 * Parse URL parameters
 */
export function getURLParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
