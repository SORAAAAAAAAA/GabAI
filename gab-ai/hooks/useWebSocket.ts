import { useEffect, useRef, useState, useCallback } from 'react';
import { EvaluationData } from '@/types/evaluation';

interface WebSocketMessage {
  id?: string; // Unique identifier for tracking
  type: 'message' | 'error' | 'connected' | 'ai_chunk' | 'user_message' | 'session_ended' | 'interview_ended';
  data?: unknown;
  error?: string;
  evaluation?: EvaluationData | null;
  message?: string;
}

export function useWebSocketChat(sessionId: string | null) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasInitializedRef = useRef(false);  // ← Persist across StrictMode runs

  // Initialize AudioContext once
  const getAudioContext = useCallback(async (): Promise<AudioContext> => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('AudioContext resumed');
    }

    audioContextRef.current = audioContext;
    return audioContext;
  }, []);

  const playAudioChunk = useCallback(async (audioBase64: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Playing audio chunk, base64 length:', audioBase64.length);
        const cleanBase64 = audioBase64.replace(/\s/g, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioContext = await getAudioContext();  // ← Use shared context

        console.log('AudioContext state:', audioContext.state);
        
        audioContext.decodeAudioData(
          bytes.buffer,
          (audioBuffer) => {
            console.log('Audio decoded successfully, duration:', audioBuffer.duration);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            source.onended = () => {
              console.log('Audio chunk finished playing');
              resolve();
            };
            
            source.start(0);
            console.log('Audio playback started');
          },
          (error) => {
            console.error('Error decoding audio:', error);
            reject(error);
          }
        );
      } catch (error) {
        console.error('Error in playAudioChunk:', error);
        reject(error);
      }
    });
  }, [getAudioContext]);

  // Define playAudioQueue with useCallback to memoize it
  const handlePlayAudioQueue = useCallback(async () => {
    console.log('playAudioQueue called, queue length:', audioQueueRef.current.length, 'isPlaying:', isPlayingRef.current);
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    
    isPlayingRef.current = true;
    
    while (audioQueueRef.current.length > 0) {
      const audioBase64 = audioQueueRef.current.shift();
      if (audioBase64) {
        try {
          await playAudioChunk(audioBase64);
        } catch (error) {
          console.error('Error playing audio chunk:', error);
        }
      }
    }
    
    isPlayingRef.current = false;
    console.log('playAudioQueue finished');
  }, [playAudioChunk]);

  // Connect to WebSocket
  useEffect(() => {
    if (!sessionId) {
      hasInitializedRef.current = false;  // Reset when no sessionId
      return;
    }
    
    // In StrictMode, this effect runs twice. Skip the second run.
    if (hasInitializedRef.current) {
      console.log('WebSocket already initialized, skipping duplicate initialization');
      return;
    }

    hasInitializedRef.current = true;  // Mark as initialized
    console.log('Creating new WebSocket connection');
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_SERVER_URL}?sessionToken=${sessionId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = async () => {
      console.log('WebSocket connected');
      // Initialize AudioContext on connection to comply with browser autoplay policy
      try {
        const ctx = await getAudioContext();
        console.log('✅ AudioContext initialized on WebSocket connection, state:', ctx.state);
      } catch (error) {
        console.error('❌ Failed to initialize AudioContext on connection:', error);
        // Don't fail the whole connection, just log the error
      }
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      console.log('Message from server:', event.data);
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data);
        setMessages((prev) => [...prev, { 
          type: 'error', 
          error: 'Failed to parse server message' 
        }]);
        return;
      }
      
      // Handle session ended message
      if (message.type === 'session_ended') {
        console.log('Session ended from server:', message.message);
        setConnected(false);
        
        // Stop audio playback and clear queue
        isPlayingRef.current = false;
        audioQueueRef.current = [];
        
        // Close AudioContext
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(err => 
            console.error('Error closing AudioContext:', err)
          );
          audioContextRef.current = null;
        }
        
        setMessages((prev) => [...prev, { 
          type: 'session_ended', 
          message: message.message || 'Session has been terminated'
        }]);
        
        if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
          console.log('Closing WebSocket due to session end');
          ws.current.close();
        }
      }

      // Handle interview ended message
      if (message.type === 'interview_ended') {
        console.log('Interview ended:', message.message);
        setMessages((prev) => [...prev, message]);
        return;
      }
      
      // Handle streaming chunks
      if (message.type === 'ai_chunk') {
        const chunkData = message.data as { text: string; audioBase64: string; evaluation?: string; isComplete: boolean };
        
        let evaluationData: EvaluationData | null = null;
        if (chunkData.evaluation) {
          console.log('Received evaluation data:', chunkData.evaluation);
          evaluationData = typeof chunkData.evaluation === 'string' 
            ? JSON.parse(chunkData.evaluation) 
            : chunkData.evaluation;
          setEvaluation(evaluationData);
        };

        // Queue audio for playback
        if (chunkData.audioBase64) {
          console.log('Received audio chunk, adding to queue');
          audioQueueRef.current.push(chunkData.audioBase64);
          handlePlayAudioQueue(); // Use local function
        }
        
        // Accumulate text chunks
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          
          // If last message is incomplete ai_chunk, update it
          if (lastMsg && lastMsg.type === 'ai_chunk' && !(lastMsg.data as { isComplete?: boolean })?.isComplete) {
            const updatedData = {
              text: ((lastMsg.data as { text: string }).text || '') + chunkData.text,
              isComplete: chunkData.isComplete
            };
            const updatedMsg = { ...lastMsg, type: 'ai_chunk' as const, data: updatedData };
            if (evaluationData) {
              updatedMsg.evaluation = evaluationData;
            }
            return [...prev.slice(0, -1), updatedMsg];
          } else {
            // Start new chunk message
            const newMsg: WebSocketMessage = { 
              type: 'ai_chunk', 
              data: { text: chunkData.text, isComplete: chunkData.isComplete }
            };
            if (evaluationData) {
              newMsg.evaluation = evaluationData;
            }
            return [...prev, newMsg];
          }
        });
      } else {
        setMessages((prev) => [...prev, message]);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error event:', error);
      const errorEvent = error as Event;
      const target = errorEvent.target as WebSocket;
      console.error('WebSocket ready state:', target?.readyState);
      setMessages((prev) => [...prev, { type: 'error', error: 'WebSocket connection error' }]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      
      // Stop audio playback and clear queue
      isPlayingRef.current = false;
      audioQueueRef.current = [];
      
      // Stop AudioContext if needed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(err => 
          console.error('Error closing AudioContext:', err)
        );
        audioContextRef.current = null;
      }
    };
    
  }, [sessionId, getAudioContext, handlePlayAudioQueue]);

  // Send message to WebSocket
  const sendMessage = useCallback((message: unknown) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      
      // Add user message to local messages state for display with unique ID
      const msgObj = message as Record<string, unknown>;
      if (msgObj.type === 'user_message') {
        const messageId = `msg_${Date.now()}_${Math.random()}`;
        setMessages((prev) => [...prev, {
          id: messageId,
          type: 'user_message',
          data: { content: msgObj.message as string }
        }]);
      }
    } else {
      console.error('WebSocket not connected');
    }
  }, []);

  // Close WebSocket connection
  const closeWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'session_ended', message: 'Client closing connection'}));
      ws.current.close(1000, 'Client closing connection');
      console.log('WebSocket connection closed by client');
      setConnected(false);
    }
  }, []);

  return { connected, messages, sendMessage, evaluation, closeWebSocket };
}