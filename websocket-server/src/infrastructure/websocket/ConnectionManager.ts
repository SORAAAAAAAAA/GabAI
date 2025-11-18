/**
 * WebSocket Connection Handler
 * Handles WebSocket connection lifecycle and message routing
 * Single Responsibility: Manages WebSocket communication only
 */

import WebSocket from 'ws';

export interface ConnectionConfig {
  allowedOrigin: string;
  perMessageDeflate: boolean;
}

/**
 * Manages WebSocket server connections
 * Follows the Open/Closed principle - extendable for new message types
 */
export class WebSocketConnectionManager {
  verifyClientConnection(info: unknown, allowedOrigin: string): boolean {
    try {
      const infoObj = info as Record<string, unknown>;
      const origin = (infoObj.origin as string) || '';

      if (origin === allowedOrigin) {
        return true;
      }

      console.warn(`[ConnectionManager] WebSocket connection rejected from origin: ${origin}`);
      return false;
    } catch (error) {
      console.error('[ConnectionManager] Error verifying client:', error);
      return false;
    }
  }

  sendMessage(ws: WebSocket, message: unknown): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[ConnectionManager] Error sending message:', error);
      }
    }
  }

  sendError(ws: WebSocket, error: string): void {
    this.sendMessage(ws, { type: 'error', error });
  }

  isConnectionOpen(ws: WebSocket): boolean {
    return ws.readyState === WebSocket.OPEN;
  }

  closeConnection(ws: WebSocket, code?: number, reason?: string): void {
    try {
      ws.close(code, reason);
    } catch (error) {
      console.error('[ConnectionManager] Error closing connection:', error);
    }
  }
}
