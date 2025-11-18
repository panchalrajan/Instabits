/**
 * Type Definitions Index
 * Central export for all type definitions
 */

export * from './service.types';
export * from './feature.types';
export * from './config.types';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type Disposable = () => void;
