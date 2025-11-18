/**
 * Service Container
 * Dependency Injection Container
 * Implements Dependency Inversion Principle
 */

import type { IServiceContainer, ServiceFactory } from '@app-types';

export class ServiceContainer implements IServiceContainer {
  private static instance: ServiceContainer;
  private services = new Map<string, unknown>();
  private factories = new Map<string, ServiceFactory<unknown>>();

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Register a service or factory
   */
  register<T>(name: string, service: T | ServiceFactory<T>): void {
    if (typeof service === 'function') {
      // Store as factory
      this.factories.set(name, service as ServiceFactory<unknown>);
    } else {
      // Store as singleton
      this.services.set(name, service);
    }
  }

  /**
   * Get a service
   */
  get<T>(name: string): T {
    // Check if already instantiated
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    // Check if factory exists
    if (this.factories.has(name)) {
      const factory = this.factories.get(name)!;
      const instance = factory();
      this.services.set(name, instance);
      return instance as T;
    }

    throw new Error(`Service not found: ${name}`);
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }

  /**
   * Get all service names
   */
  getServiceNames(): string[] {
    return [
      ...Array.from(this.services.keys()),
      ...Array.from(this.factories.keys()),
    ];
  }
}
