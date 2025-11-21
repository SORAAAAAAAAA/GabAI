'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseSessionExitProps {
  sessionId: string | null;
  isInActiveSession: boolean;
}

export function useSessionExit({ sessionId, isInActiveSession }: UseSessionExitProps) {
  const router = useRouter();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);
  const [exitSession, setExitSession] = useState(false);

  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsExiting(true);
      const response = await fetch('/api/session/end-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      setExitSession(true);
      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    } finally {
      setIsExiting(false);
    }
  }, [sessionId]);

  const handleNavigationIntent = useCallback((path: string) => {
    // If not in active session, navigate directly
    if (!isInActiveSession) {
      router.push(path);
      return;
    }

    // Show confirmation dialog
    setPendingNavigationPath(path);
    setIsConfirmationOpen(true);
  }, [isInActiveSession, router]);

  const handleContinueInterview = useCallback(() => {
    setIsConfirmationOpen(false);
    setPendingNavigationPath(null);
  }, []);

  const handleExitSession = useCallback(async () => {
    try {
      await endSession();
      setIsConfirmationOpen(false);

      // Navigate to pending path or dashboard
      const destination = pendingNavigationPath || '/dashboard';
      setPendingNavigationPath(null);
      router.push(destination);
    } catch (error) {
      console.error('Failed to exit session:', error);
      alert('Failed to end session. Please try again.');
    }
  }, [endSession, pendingNavigationPath, router]);

  return {
    isConfirmationOpen,
    isExiting,
    pendingNavigationPath,
    handleNavigationIntent,
    handleContinueInterview,
    handleExitSession,
    endSession,
    exitSession,
  };
}
