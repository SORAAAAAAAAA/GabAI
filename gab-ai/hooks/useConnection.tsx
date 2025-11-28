'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { TokenSource } from 'livekit-client';
import { SessionProvider, useSession } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { useInterviewData } from '@/context/InterviewDataContext';

interface ConnectionContextType {
  isConnectionActive: boolean;
  connect: (startSession?: boolean) => void;
  startDisconnectTransition: () => void;
  onDisconnectTransitionComplete: () => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnectionActive: false,
  connect: () => {},
  startDisconnectTransition: () => {},
  onDisconnectTransitionComplete: () => {},
});

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return ctx;
}

interface ConnectionProviderProps {
  appConfig: AppConfig;
  children: React.ReactNode;
}

export function ConnectionProvider({ appConfig, children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);
  const { interviewData } = useInterviewData();

  const tokenSource = useMemo(() => {
    // Log interview data when it's received
    console.log('[useConnection] Interview data received:', {
      job: interviewData?.job,
      resume: interviewData?.resume ? `${interviewData.resume.substring(0, 50)}...` : '',
      userName: interviewData?.userName,
    });

    // Always use custom endpoint to pass interview data
    return TokenSource.custom(async () => {
      const endpoint = process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT || '/api/connection-details';
      const url = new URL(endpoint, window.location.origin);

      console.log('[useConnection] Calling connection-details with data:', {
        job: interviewData?.job,
        resume: interviewData?.resume ? `${interviewData.resume.substring(0, 50)}...` : '',
        userName: interviewData?.userName,
      });

      try {
        const res = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Sandbox-Id': appConfig.sandboxId ?? '',
          },
          body: JSON.stringify({
            room_config: appConfig.agentName
              ? {
                  agents: [{ agent_name: appConfig.agentName }],
                }
              : undefined,
            // Pass interview data to connection-details
            job: interviewData?.job || '',
            resume: interviewData?.resume || '',
            userName: interviewData?.userName || '',
          }),
        });
        const connectionDetails = await res.json();
        console.log('[useConnection] Connection details received:', connectionDetails);
        return connectionDetails;
      } catch (error) {
        console.error('Error fetching connection details:', error);
        throw new Error('Error fetching connection details!');
      }
    });
  }, [appConfig, interviewData]);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const value = useMemo(() => {
    return {
      isConnectionActive,
      connect: () => {
        setIsConnectionActive(true);
        startSession();
      },
      startDisconnectTransition: () => {
        setIsConnectionActive(false);
      },
      onDisconnectTransitionComplete: () => {
        endSession();
      },
    };
  }, [startSession, endSession, isConnectionActive]);

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
    </SessionProvider>
  );
}
