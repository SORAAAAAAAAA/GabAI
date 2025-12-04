'use client';

import { createContext, useContext, useMemo, useState, useRef } from 'react';
import { TokenSource } from 'livekit-client';
import { SessionProvider, useSession,  } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { useInterviewData } from '@/context/InterviewDataContext';
import { useEvaluator } from './useEvaluator';

export interface InterviewData {
  job: string;
  resume: string;
  userName: string;
  sessionId?: string;
}

interface ConnectionContextType {
  isConnectionActive: boolean;
  connect: (interviewData?: InterviewData) => void;
  startDisconnectTransition: () => void;
  endInterviewSession: () => Promise<void>; // Called when user clicks END INTERVIEW
  onDisconnectTransitionComplete: () => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnectionActive: false,
  connect: () => {},
  startDisconnectTransition: () => {},
  endInterviewSession: async () => {},
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
  const [passedInterviewData, setPassedInterviewData] = useState<InterviewData | null>(null);
  const { interviewData: contextInterviewData, setLatestEvaluation } = useInterviewData();
  const { setIsEvaluatorActive, setEvaluationData, setIsEvaluationLoading } = useEvaluator();
  
  // Use a ref to always have the latest interview data available to tokenSource closure
  const interviewDataRef = useRef<InterviewData | null>(null);
  
  // Update ref whenever interview data changes
  const interviewData = passedInterviewData || contextInterviewData;
  interviewDataRef.current = interviewData;

  const tokenSource = useMemo(() => {
    console.log('[ConnectionProvider] Creating tokenSource. Current interviewData:', {
      hasJob: !!interviewData?.job,
      hasResume: !!interviewData?.resume,
      hasUserName: !!interviewData?.userName,
      hasSessionId: !!interviewData?.sessionId,
      isPassed: !!passedInterviewData,
    });

    // Always use custom endpoint to pass interview data
    return TokenSource.custom(async () => {
      const endpoint = '/api/connection-details';
      const url = new URL(endpoint, window.location.origin);

      // Use ref to get the latest interview data (passed data takes priority)
      const latestData = interviewDataRef.current;
      console.log('[TokenSource.custom] About to fetch. Current interviewData from ref:', {
        job: latestData?.job,
        resume: latestData?.resume ? `${latestData.resume.substring(0, 50)}...` : 'EMPTY',
        userName: latestData?.userName,
        sessionId: latestData?.sessionId || 'MISSING',
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
            job: latestData?.job || '',
            resume: latestData?.resume || '',
            userName: latestData?.userName || '',
            sessionId: latestData?.sessionId || '',
          }),
        });
        const connectionDetails = await res.json();
        console.log('[TokenSource.custom] Connection details received:', connectionDetails);
        return connectionDetails;
      } catch (error) {
        console.error('[TokenSource.custom] Error fetching connection details:', error);
        throw new Error('Error fetching connection details!');
      }
    });
  }, [appConfig, interviewData, passedInterviewData]);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const value = useMemo(() => {
    return {
      isConnectionActive,
      connect: async (passedData?: InterviewData) => {
        console.log('[useConnection] connect() called with data:', {
          passed: !!passedData,
          job: passedData?.job || interviewData?.job,
          resume: (passedData?.resume || interviewData?.resume)?.substring(0, 50),
          userName: passedData?.userName || interviewData?.userName,
        });
        
        // Verify data is available before connecting
        const dataToUse = passedData || interviewData;
        if (!dataToUse?.job || !dataToUse?.resume || !dataToUse?.userName) {
          console.error('[useConnection] Interview data is incomplete:', dataToUse);
          throw new Error('Interview data is not complete. Please try again.');
        }
        
        // If interview data is passed directly, store it immediately
        if (passedData) {
          setPassedInterviewData(passedData);
          console.log('[useConnection] Interview data passed to connect(), will be used by tokenSource');
          // Wait for state update to be processed before initiating connection
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        setIsConnectionActive(true);
        startSession();
      },
      startDisconnectTransition: () => {
        // Called automatically when agent fails - just disconnect without evaluator API
        setIsConnectionActive(false);
      },
      endInterviewSession: async () => {
        // Called when user manually clicks END INTERVIEW button
        setIsConnectionActive(false);
        // Wait for animation to complete before starting evaluator
        await new Promise(resolve => setTimeout(resolve, 600)); // Match animation duration
        setIsEvaluatorActive(true);
        setIsEvaluationLoading(true);
        // Call API to end evaluator session
        try {
          const response = await fetch('/api/ai/end-evaluator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: interviewDataRef.current?.sessionId }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }

          const data = await response.json();
          
          // Parse the evaluation response if it's a string (JSON string from Gemini)
          let evaluationData = data.evaluationResponse;
          if (typeof evaluationData === 'string') {
            // Remove markdown code block formatting if present
            evaluationData = evaluationData.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
            evaluationData = JSON.parse(evaluationData);
          }
          
          setEvaluationData(evaluationData);
        } catch (error) {
          console.error('[endInterviewSession] Error calling end-evaluator API:', error);
        } finally {
          setIsEvaluationLoading(false);
        }
      },
      onDisconnectTransitionComplete: () => {
        endSession();
        // Reset evaluation data when session ends
        setLatestEvaluation(null);
      },
    };
  }, [startSession, endSession, isConnectionActive, interviewData, setLatestEvaluation, setIsEvaluatorActive, setEvaluationData, setIsEvaluationLoading]);

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
    </SessionProvider>
  );
}
