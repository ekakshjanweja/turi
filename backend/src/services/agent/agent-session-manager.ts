import type {
  AgentSession,
  AgentSessionWithActivity,
  AgentSessionConfig,
  SessionHealthInfo,
  UserSessionInfo,
} from "../../lib/types/types";

// Configuration constants
export const AGENT_SESSION_CONFIG: AgentSessionConfig = {
  MAX_SESSIONS: 100,
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  CONNECTION_TIMEOUT_MS: 60 * 1000, // 1 minute
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// Enhanced session management
export class AgentSessionManager {
  private sessions = new Map<string, AgentSessionWithActivity>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredSessions();
    }, AGENT_SESSION_CONFIG.CLEANUP_INTERVAL_MS);
  }

  private cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (
        now - session.lastActivity >
        AGENT_SESSION_CONFIG.SESSION_TIMEOUT_MS
      ) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.removeSession(sessionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  getSession(sessionId: string): AgentSessionWithActivity | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  createSession(sessionId: string, agentSession: AgentSession): boolean {
    if (this.sessions.size >= AGENT_SESSION_CONFIG.MAX_SESSIONS) {
      console.warn(
        `Maximum sessions reached (${AGENT_SESSION_CONFIG.MAX_SESSIONS})`
      );
      this.cleanupOldestSession();
    }

    const sessionWithActivity = {
      ...agentSession,
      lastActivity: Date.now(),
    };

    this.sessions.set(sessionId, sessionWithActivity);
    console.log(`Created new session for user: ${sessionId}`);
    return true;
  }

  updateSession(sessionId: string, updates: Partial<AgentSession>) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates, { lastActivity: Date.now() });
    }
  }

  removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        session.agent?.close();
      } catch (error) {
        console.error(`Error closing agent for session ${sessionId}:`, error);
      }
      this.sessions.delete(sessionId);
      console.log(`Removed session for user: ${sessionId}`);
      return true;
    }
    return false;
  }

  private cleanupOldestSession() {
    let oldestSession: string | null = null;
    let oldestTime = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < oldestTime) {
        oldestTime = session.lastActivity;
        oldestSession = sessionId;
      }
    }

    if (oldestSession) {
      this.removeSession(oldestSession);
    }
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    for (const sessionId of this.sessions.keys()) {
      this.removeSession(sessionId);
    }
  }

  // Health check information
  getHealthInfo(): SessionHealthInfo {
    return {
      sessionCount: this.getSessionCount(),
      maxSessions: AGENT_SESSION_CONFIG.MAX_SESSIONS,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // Get session existence for a specific user (for security)
  getUserSessionInfo(userId: string): UserSessionInfo {
    return {
      sessionCount: this.getSessionCount(),
      userSessionExists: !!this.getSession(userId),
    };
  }
}
