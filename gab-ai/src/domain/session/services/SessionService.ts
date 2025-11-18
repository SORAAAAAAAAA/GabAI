/**
 * Session Service Interface and Implementation
 * Single Responsibility: Only handles session-related operations
 * Open/Closed: Extendable through interface without modifying existing code
 */

import { Session, StartSessionResponse } from '@/src/shared/types';
import { ISupabaseClient } from '@/src/infrastructure/supabase/client';
import { API_ENDPOINTS } from '@/src/shared/constants';
import { UUID } from 'crypto';

/**
 * Interface for Session operations
 * Allows multiple implementations and easy testing
 */
export interface ISessionService {
  startSession(userId: UUID, jobTitle: string, resume: string): Promise<StartSessionResponse>;
  getSession(sessionId: string): Promise<Session | null>;
  endSession(sessionId: string): Promise<void>;
  getUserSessions(userId: string): Promise<Session[]>;
}

/**
 * Concrete implementation of session service
 */
export class SessionService implements ISessionService {
  constructor(private supabase: ISupabaseClient) {}

  async startSession(
    userId: UUID,
    jobTitle: string,
    resume: string
  ): Promise<StartSessionResponse> {
    try {
      const res = await fetch(API_ENDPOINTS.SESSION.START, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          job_title: jobTitle,
          resume,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Start session failed: ${errorText}`);
      }

      return res.json();
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) return null;

      return data as Session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async endSession(sessionId: string): Promise<void> {
    try {
      const res = await fetch(API_ENDPOINTS.SESSION.END, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        throw new Error('Failed to end session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const { data, error } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId);

      if (error) return [];

      return data as Session[];
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }
}
