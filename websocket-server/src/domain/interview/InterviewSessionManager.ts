/**
 * Interview Session Manager for WebSocket Server
 * Handles interview state and lifecycle
 * Single Responsibility: Manages interview session state only
 */

interface InterviewSessionData {
  userId: string;
  sessionId: string;
  jobTitle: string;
  resumeText: string;
  userName: string;
}

/**
 * Manages interview session lifecycle and state
 */
export class InterviewSessionManager {
  private sessions: Map<string, InterviewSessionData> = new Map();

  createSession(sessionData: InterviewSessionData): void {
    this.sessions.set(sessionData.sessionId, sessionData);
    console.log(`[SessionManager] Session created: ${sessionData.sessionId}`);
  }

  getSession(sessionId: string): InterviewSessionData | undefined {
    return this.sessions.get(sessionId);
  }

  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    console.log(`[SessionManager] Session removed: ${sessionId}`);
  }

  sessionExists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  getAllSessions(): InterviewSessionData[] {
    return Array.from(this.sessions.values());
  }
}
