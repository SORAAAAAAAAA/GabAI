/**
 * Dependency Injection Container
 * Implements the Service Locator pattern for centralized dependency management
 * Follows the Dependency Inversion principle
 */

import { createSupabaseClient, ISupabaseClient } from '@/src/infrastructure/supabase/client';
import { AuthService, IAuthService } from '@/src/domain/auth/services/AuthService';
import { ResumeService, IResumeService } from '@/src/domain/resume/services/ResumeService';
import { SessionService, ISessionService } from '@/src/domain/session/services/SessionService';

/**
 * Service Container for managing dependencies
 * Single Responsibility: Only manages object creation and initialization
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, unknown> = new Map();

  private constructor() {
    this.registerDefaultServices();
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  private registerDefaultServices(): void {
    // Register Supabase Client
    const supabaseClient = createSupabaseClient();
    this.register<ISupabaseClient>('supabaseClient', supabaseClient);

    // Register Services
    this.register<IAuthService>(
      'authService',
      new AuthService(supabaseClient)
    );

    this.register<IResumeService>(
      'resumeService',
      new ResumeService(supabaseClient)
    );

    this.register<ISessionService>(
      'sessionService',
      new SessionService(supabaseClient)
    );
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found in container`);
    }
    return service as T;
  }

  // Convenience getters for commonly used services
  getAuthService(): IAuthService {
    return this.get<IAuthService>('authService');
  }

  getResumeService(): IResumeService {
    return this.get<IResumeService>('resumeService');
  }

  getSessionService(): ISessionService {
    return this.get<ISessionService>('sessionService');
  }

  getSupabaseClient(): ISupabaseClient {
    return this.get<ISupabaseClient>('supabaseClient');
  }
}
