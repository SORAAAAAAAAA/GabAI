/**
 * Authentication Service Interface and Implementation
 * Dependency Inversion: Depends on abstractions, not concrete implementations
 */

import { User } from '@/src/shared/types';
import { ISupabaseClient } from '@/src/infrastructure/supabase/client';

export interface AuthSession {
  user: User | null;
  session: {
    access_token: string;
    refresh_token: string;
    user: User;
  } | null;
}

/**
 * Interface for Authentication operations
 * Allows multiple implementations and easy testing
 */
export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  logoutUser(): Promise<void>;
  signUpUser(email: string, password: string, fullName: string): Promise<AuthSession>;
  signInUser(email: string, password: string): Promise<AuthSession>;
}

/**
 * Concrete implementation of authentication service
 * Single Responsibility: Only handles authentication logic
 */
export class AuthService implements IAuthService {
  constructor(private supabase: ISupabaseClient) {}

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async logoutUser(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async signUpUser(
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthSession> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName,
          },
        },
      });

      if (error) throw error;

      return {
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              user_metadata: data.user.user_metadata,
            }
          : null,
        session: data.session,
      };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async signInUser(
    email: string,
    password: string
  ): Promise<AuthSession> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              user_metadata: data.user.user_metadata,
            }
          : null,
        session: data.session,
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }
}
