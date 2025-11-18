/**
 * Custom Hook: useSessionStart
 * Refactored to use dependency injection
 * Single Responsibility: Handles session initiation logic only
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceContainer } from '@/src/application/di/ServiceContainer';
import { UUID } from 'crypto';

export interface UseSessionStartReturn {
  sessionStart: boolean;
  startInterview: (jobRole: string, resumeText: string) => Promise<void>;
}

export function useSessionStart(): UseSessionStartReturn {
  const [sessionStart, setSessionStart] = useState<boolean>(false);
  const router = useRouter();
  const sessionService = ServiceContainer.getInstance().getSessionService();
  const authService = ServiceContainer.getInstance().getAuthService();

  const startInterview = useCallback(
    async (jobRole: string, resumeText: string) => {
      if (!jobRole.trim()) {
        throw new Error('Job role is required to start the session.');
      }

      setSessionStart(true);

      try {
        const user = await authService.getCurrentUser();
        const userID = user?.id as UUID;

        if (!userID) {
          throw new Error('User not authenticated');
        }

        console.log('[startInterview] Starting session for user:', userID);

        const responseData = await sessionService.startSession(userID, jobRole.trim(), resumeText);

        console.log('[startInterview] Session started:', responseData.sessionId);

        // Redirect to chatbot page
        router.push(`/session/chatbot?sessionId=${responseData.sessionId}&wsURL=${encodeURIComponent(responseData.wsUrl)}`);
      } catch (error) {
        console.error('[startInterview] Error:', error);
        throw error;
      } finally {
        setSessionStart(false);
      }
    },
    [sessionService, authService, router]
  );

  return { sessionStart, startInterview };
}
