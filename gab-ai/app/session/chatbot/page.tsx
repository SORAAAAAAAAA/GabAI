'use client';
import { useState, Suspense, useEffect } from 'react';
import { useRef } from 'react';
import { useWebSocketChat } from '@/hooks/useWebSocket';
import { useSessionExit } from '@/hooks/useSessionExit';
import { useSearchParams } from 'next/navigation';
import SessionExitConfirmation from '@/app/session/components/SessionExitConfirmation';
import { closeSessionAPI } from '@/utils/api/api.closeSession';


// Main component that uses useSearchParams wrapped in Suspense
export default function ChatbotPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatbotContent />
    </Suspense>
  );
}

// Content component that uses useSearchParams
function ChatbotContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');  
  const {
    isConfirmationOpen,
    isExiting,
    handleExitSession,
    handleContinueInterview,
  } = useSessionExit({
    sessionId,
    isInActiveSession: true, // Always active in chatbot page
  });
  
  const { messages, sendMessage } = useWebSocketChat(sessionId);

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect if AI is currently speaking by checking only the most recent ai_chunk
  const isSpeaking = (() => {
    // Find the most recent ai_chunk message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'ai_chunk') {
        const chunkData = messages[i].data as { isComplete?: boolean };
        return !chunkData.isComplete; // Only the most recent chunk matters
      }
    }
    return false; // No ai_chunk found, AI is not speaking
  })();

  // Initialize MediaRecorder on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('MediaRecorder not supported in this browser');
      return;
    }

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-send message when speech ends
  useEffect(() => {
    if (!inputText.trim() || isListening) return;

    const timer = setTimeout(() => {
      if (inputText.trim()) {
        sendMessage({
          type: 'user_message',
          message: inputText,
          sessionId: sessionId,
        });
        setInputText('');
      }
    }, 1000); // Wait 1 second after user stops talking to auto-send

    return () => clearTimeout(timer);
  }, [inputText, isListening, sendMessage, sessionId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start recording audio using MediaRecorder
  const startListening = async () => {
    if (isListening) return;
    
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording end
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Send audio blob to backend for transcription
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('sessionId', sessionId || '');
        
        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          if (data.transcript) {
            setInputText(data.transcript);
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
        }
        
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      setIsListening(true);
      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting microphone:', error);
      alert('Microphone permission denied. Please enable microphone access in browser settings.');
    }
  };

  // Stop recording
  const stopListening = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    mediaRecorderRef.current.stop();
    setIsListening(false);
  };


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Interview</h1>
            <p className="text-gray-600 text-sm mt-1">Speak naturally - just have a conversation</p>
          </div>
          
          {/* Status Indicator and End Session Button */}
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
              <div className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-red-500 animate-pulse' :
                isSpeaking ? 'bg-blue-500 animate-pulse' :
                'bg-green-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
              </span>
            </div>

            {/* End Session Button */}
            <button
              onClick={async () => { if (sessionId) { await closeSessionAPI(sessionId); handleExitSession(); } }}
              disabled={isExiting}
              className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isExiting ? 'Exiting...' : 'End Session'}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 py-8 min-h-0">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">Welcome to your AI Interview</p>
                <p className="text-gray-600">Click the microphone below to start speaking</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAI = msg.type === 'ai_chunk';
              let messageText = '';
              
              if (msg.type === 'ai_chunk') {
                messageText = (msg.data as Record<string, unknown>)?.text as string || '';
              } else if (msg.type === 'message') {
                messageText = (msg.data as Record<string, unknown>)?.content as string || '';
              } else if (msg.type === 'user_message') {
                messageText = (msg.data as Record<string, unknown>)?.content as string || '';
              }
              
              if (!messageText) return null;
              
              return (
                <div key={index} className={`flex ${isAI ? 'justify-start' : 'justify-end'} px-6`}>
                  <div
                    className={`max-w-2xl px-5 py-3 rounded-2xl shadow-sm ${
                      isAI
                        ? 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                        : 'bg-blue-600 text-white rounded-tr-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{messageText}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-8 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Transcript Display */}
          {inputText && (
            <div className="bg-gray-50 border border-gray-200 text-gray-900 px-6 py-4 rounded-xl mb-6 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your message</p>
              <p className="text-base leading-relaxed text-gray-900">{inputText}</p>
              <p className="text-xs text-gray-400 mt-2">Sending when you stop talking...</p>
            </div>
          )}
          
          {/* Voice Button and Info */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full font-bold text-white shadow-lg transition-all duration-200 transform hover:scale-110 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-200'
                  : 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-200'
              }`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                {isListening ? (
                  <path fillRule="evenodd" d="M6 4a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1H8z" clipRule="evenodd" />
                ) : (
                  <path d="M8 16A6 6 0 1020 10a1 1 0 11-2 0 4 4 0 10-8 0v3.5a3 3 0 11-6 0V10a1 1 0 112 0v3.5a1 1 0 001 1v1a6 6 0 006 6z" />
                )}
              </svg>
            </button>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                {isListening ? 'Tap to stop listening' : 'Tap to start speaking'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Your message will be sent automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Exit Confirmation Modal */}
      <SessionExitConfirmation
        isOpen={isConfirmationOpen}
        onContinue={handleContinueInterview}
        onExit={handleExitSession}
        isLoading={isExiting}
      />
    </div>
  );
}