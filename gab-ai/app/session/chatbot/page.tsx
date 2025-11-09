'use client';

import { useState, Suspense } from 'react';
import { useRef } from 'react';
import { useWebSocketChat } from '@/hooks/useWebSocket';
import { useSearchParams } from 'next/navigation';

// Minimal local types for browser SpeechRecognition API
interface MinimalSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  state: 'inactive' | 'recording' | 'paused';
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: MinimalSpeechRecognitionEvent) => void) | null;
  onerror: ((event: MinimalSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
interface MinimalSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string; confidence: number };
    };
  };
}
interface MinimalSpeechRecognitionErrorEvent {
  error: string;
  message?: string;
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
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  // Speech-to-Text: Record voice and send to API
  const startListening = async () => {
    if (isListening) return;
    if (typeof window === 'undefined') return;
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert('MediaRecorder not supported in this browser.');
      return;
    }
    setIsListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunks.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) return;
          // Send to speech-to-text API
          const res = await fetch('/api/ai/speech-to-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64Audio })
          });
          const data = await res.json();
          const transcript = data.transcript || '';
          setInputText(transcript);
          // Send as user message via WebSocket
          sendMessage({
            type: 'user_message',
            content: transcript,
            sessionId: sessionId,
          });
        };
        reader.readAsDataURL(audioBlob);
      };
      mediaRecorder.start();
      recognitionRef.current = mediaRecorder as unknown as MinimalSpeechRecognition;
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      }, 5000);
    } catch (err) {
      setIsListening(false);
      alert(err);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && recognitionRef.current.state !== 'inactive') {
      recognitionRef.current.stop();
    }
    setIsListening(false);
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

  // Send text input as message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    sendMessage({
      type: 'user_message',
      content: inputText,
      sessionId: sessionId,
    });
    setInputText('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Voice Interview Assistant</h2>
        <div className="mb-4 flex gap-2 justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${isListening ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isListening ? 'Stop Listening' : 'Start Talking'}
          </button>
          <button
            onClick={() => {
              const lastMessage = messages[messages.length - 1];
              const textToSpeak = lastMessage && 'data' in lastMessage ? (lastMessage.data as Record<string, unknown>)?.text as string || 'No message to repeat' : 'No message to repeat';
              speakText(textToSpeak);
            }}
            className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600"
            disabled={isSpeaking}
          >
            {isSpeaking ? 'Speaking...' : 'Repeat Last Response'}
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type your answer or use the mic..."
            className="w-full px-4 py-2 border rounded-lg"
            disabled={isListening}
          />
          <button
            onClick={handleSendMessage}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            disabled={!inputText.trim()}
          >
            Send
          </button>
        </div>
        <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-100">
          {messages.map((msg, index) => {
            const isUserMessage = msg.type === 'message' && (msg.data as { isUser?: boolean }).isUser;
            const messageText = (msg.data as { text?: string }).text || JSON.stringify(msg.data);
            return (
              <div key={index} className={`mb-2 flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-lg ${isUserMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                  {messageText}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}