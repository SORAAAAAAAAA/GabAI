'use client';

import ModalContainer from '@/components/ModalContainer';
import Sidebar from '@/components/sidebar';
import SessionExitConfirmation from '@/app/session/components/SessionExitConfirmation';
import { SessionExitProvider } from '@/context/SessionExitContext';
import { useSessionExit } from '@/hooks/useSessionExit';
import { useSearchParams, usePathname } from 'next/navigation';
import { useMemo } from 'react';

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Get sessionId from URL params (for chatbot page)
  const sessionId = useMemo(() => {
    if (typeof window !== 'undefined' && searchParams) {
      return searchParams.get('sessionId') || null;
    }
    return null;
  }, [searchParams]);
  
  // Only enable session exit protection on the chatbot page
  const isInActiveSession = useMemo(() => {
    return pathname?.includes('/session/chatbot') ?? false;
  }, [pathname]);
  
  const {
    isConfirmationOpen,
    isExiting,
    handleNavigationIntent,
    handleContinueInterview,
    handleExitSession,
  } = useSessionExit({
    sessionId,
    isInActiveSession, // Only true when on /session/chatbot
  });

  return (
    <SessionExitProvider value={{
      isConfirmationOpen,
      isExiting,
      handleNavigationIntent,
      handleContinueInterview,
      handleExitSession,
    }}>
      <ModalContainer hideBackground>
        <div className="flex h-screen w-screen relative bg-white">
          <Sidebar isInSessionLayout={true} />
          <div className="flex-1 overflow-auto bg-white">
            {children}
          </div>
        </div>
      </ModalContainer>
      
      {/* Session Exit Confirmation - Rendered outside ModalContainer to avoid z-index issues */}
      <SessionExitConfirmation
        isOpen={isConfirmationOpen}
        onContinue={handleContinueInterview}
        onExit={handleExitSession}
        isLoading={isExiting}
      />
    </SessionExitProvider>
  );
}