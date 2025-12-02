'use client';

import { RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { ConnectionProvider } from '@/hooks/useConnection';
import { useDebugMode } from '@/hooks/useDebug';
import { InterviewDataProvider } from '@/context/InterviewDataContext';
import { EvaluationHandler } from '@/components/livekit/evaluationToast';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  return (
    <InterviewDataProvider>
      <ConnectionProvider appConfig={appConfig}>
        <AppSetup />
        <main className="h-full w-full">
          <EvaluationHandler />
          <ViewController appConfig={appConfig} />
        </main>
        <StartAudio label="Start Audio" />
        <RoomAudioRenderer />
        <Toaster />
      </ConnectionProvider>
    </InterviewDataProvider>
  );
}
