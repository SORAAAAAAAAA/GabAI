import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: 'message' | 'error' | 'connected' | 'ai_response';
  data?: unknown;
  error?: string;
}

export function useWebSocketChat(sessionId: string | null) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  // Connect to WebSocket
  useEffect(() => {
    if (!sessionId) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_SERVER_URL}?sessionToken=${sessionId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      console.log('Message from server:', event.data);
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessages((prev) => [...prev, { type: 'error', error: 'Connection error' }]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [sessionId]);

  // Send message to WebSocket
  const sendMessage = useCallback((message: unknown) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }, []);

  return { connected, messages, sendMessage };
}