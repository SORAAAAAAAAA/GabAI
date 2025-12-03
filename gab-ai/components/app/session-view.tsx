'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useSessionContext, useSessionMessages } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import { FeedbackPanel } from '@/components/app/feedbackPanel';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { useConnection } from '@/hooks/useConnection';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { isConnectionActive, endInterviewSession } = useConnection();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="flex flex-col lg:flex-row h-full w-full overflow-hidden gap-2 lg:gap-4 p-2 lg:p-4 relative" {...props}>
      {/* Main Content (Left Side) */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Chat Transcript */}
        <div
          className={cn(
            'relative h-[150px] sm:h-[200px] overflow-hidden grid grid-cols-1 grid-rows-1',
            !chatOpen && 'pointer-events-none'
          )}
        >
          <Fade top className="absolute inset-x-4 top-0 h-40" />
          <ScrollArea ref={scrollAreaRef} className="px-2 sm:px-4 pt-40 pb-[100px] sm:pb-[150px] md:px-6 md:pb-[200px]">
            <ChatTranscript
              hidden={!chatOpen}
              messages={messages}
              className="mx-auto max-w-2xl space-y-3 transition-opacity duration-300 ease-out"
            />
          </ScrollArea>
        </div>

        {/* Tile Layout */}
        <TileLayout chatOpen={chatOpen} />

        {/* Bottom */}
        <MotionBottom
          {...BOTTOM_VIEW_MOTION_PROPS}
          className="relative flex-shrink-0 z-50"
        >
          {appConfig.isPreConnectBufferEnabled && (
            <PreConnectMessage messages={messages} className="pb-2 sm:pb-4" />
          )}
          <div className="bg-background relative mx-auto max-w-2xl pb-2 sm:pb-3 md:pb-12 w-full px-1 sm:px-0">
            <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
            <AgentControlBar
              controls={controls}
              isConnectionActive={isConnectionActive}
              onDisconnect={endInterviewSession}
              onChatOpenChange={setChatOpen}
            />
          </div>
        </MotionBottom>
      </div>

      {/* Feedback Panel (Right Sidebar) - Hidden by default, Stacked on mobile */}
      {feedbackOpen && (
        <div className="fixed inset-0 lg:relative lg:inset-auto w-full lg:w-80 h-full lg:h-auto bg-white border-t lg:border-t-0 lg:border-l border-gray-200 rounded-t-lg lg:rounded-lg overflow-hidden flex flex-col shadow-lg animate-in slide-in-from-bottom-4 lg:slide-in-from-right-4 z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-bold text-base sm:text-lg text-gray-900">AI Feedback</h3>
            <button
              onClick={() => setFeedbackOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Close feedback panel"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <FeedbackPanel />
          </div>
        </div>
      )}

      {/* Feedback Toggle Button (when panel is closed) */}
      {!feedbackOpen && (
        <button
          onClick={() => {
            console.log('Feedback button clicked');
            setFeedbackOpen(true);
          }}
          className="cursor-pointer fixed lg:absolute right-4 bottom-20 lg:right-8 lg:top-8 z-40 bg-black hover:bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition hover:scale-110"
          aria-label="Open feedback panel"
          title="Open AI Feedback"
        >
          📝
        </button>
      )}
    </section>
  );
};
