'use client';
import { useState, Suspense, useEffect } from 'react';
import { useRef } from 'react';
import { useWebSocketChat } from '@/hooks/useWebSocket';
import { useSearchParams } from 'next/navigation';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

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

  const { messages, sendMessage } = useWebSocketChat(sessionId);

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<object | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize SpeechRecognition on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognitionAPI = ((window as unknown) as Record<string, unknown>).SpeechRecognition || ((window as unknown) as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn('SpeechRecognition not supported in this browser');
      return;
    }

    const recognition = new (SpeechRecognitionAPI as unknown as new () => object)();
    const recognitionObj = recognition as Record<string, unknown>;
    
    recognitionObj.continuous = false;
    recognitionObj.interimResults = true;
    recognitionObj.lang = 'en-US';

    recognitionObj.onstart = () => {
      setIsListening(true);
    };

    recognitionObj.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    recognitionObj.onerror = (event: Event) => {
      const errorEvent = event as unknown as { error: string };
      console.error('Speech recognition error:', errorEvent.error);
      
      if (errorEvent.error === 'not-allowed') {
        console.warn('Microphone permission denied. Please enable microphone in browser settings.');
        alert('Microphone permission denied. Please enable microphone access in your browser settings and refresh the page.');
      } else if (errorEvent.error === 'no-speech') {
        console.warn('No speech detected. Please try again.');
      } else if (errorEvent.error === 'network') {
        console.warn('Network error. Please check your connection.');
      }
      setIsListening(false);
    };

    recognitionObj.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Auto-send message when speech ends
  useEffect(() => {
    if (!inputText.trim() || isListening) return;

    const timer = setTimeout(() => {
      if (inputText.trim()) {
        sendMessage({
          type: 'user_message',
          content: inputText,
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

  // Speech-to-Text: Start listening using Web Speech API
  const startListening = async () => {
    if (isListening || !recognitionRef.current) return;
    
    try {
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
          console.error('Microphone permission denied:', err);
          alert('Microphone permission denied. Please enable microphone access in browser settings.');
          return;
        }
      }
      
      setInputText('');
      const recognition = recognitionRef.current as unknown as { 
        start: () => void;
      };
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Could not start microphone. Please check your browser permissions.');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (!recognitionRef.current) return;
    const recognition = recognitionRef.current as unknown as { stop: () => void };
    recognition.stop();
  };

  // Text-to-Speech: Speak text
  const speakText = (text: string) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    synth.speak(utter);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400">
      {/* Header */}
      <div className="flex-shrink-0 bg-blue-900 bg-opacity-40 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">AI Interview</h1>
            <p className="text-blue-100 text-sm mt-1">Speak naturally - just have a conversation</p>
          </div>
          <div className="text-right text-black">
            <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm whitespace-nowrap">
              {isListening ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  Listening...
                </span>
              ) : isSpeaking ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Speaking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container - Only scrollable part */}
      <div className="flex-1 overflow-y-auto py-6 min-h-0">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <p className="text-lg font-semibold mb-2">👋 Welcome to your AI Interview</p>
                <p className="text-blue-100">Click the microphone below to start speaking</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAI = msg.type === 'ai_response';
              let messageText = '';
              
              if (isAI) {
                messageText = (msg.data as Record<string, unknown>)?.text as string || '';
              } else if (msg.type === 'message') {
                messageText = (msg.data as Record<string, unknown>)?.content as string || '';
              } else if (msg.type === 'user_message') {
                messageText = (msg.data as Record<string, unknown>)?.content as string || '';
              }
              
              if (!messageText) return null;
              
              return (
                <div key={index} className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} px-6`}>
                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-lg ${
                      isAI
                        ? 'bg-white bg-opacity-95 text-gray-900 rounded-bl-none'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{messageText}</p>
                    {isAI && (
                      <button
                        onClick={() => speakText(messageText)}
                        disabled={isSpeaking}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        🔊 Repeat
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-blue-900 bg-opacity-40 p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          {/* Voice Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative w-20 h-20 rounded-full font-bold text-white shadow-2xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-300'
                  : 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 ring-4 ring-green-300'
              }`}
            >
              <span className="text-3xl">{isListening ? '⏸️' : '🎤'}</span>
            </button>
          </div>

          {/* Transcript Display */}
          {inputText && (
            <div className="bg-white bg-opacity-95 text-gray-900 px-6 py-4 rounded-2xl mb-4 text-center">
              <p className="text-sm text-gray-500 mb-2 font-semibold">Your message:</p>
              <p className="text-lg leading-relaxed">{inputText}</p>
              <p className="text-xs text-gray-400 mt-2">Sending when you stop talking...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}