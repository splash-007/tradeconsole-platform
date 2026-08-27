// BACKEND INTEGRATION: POST /api/v1/calls/*
// Architecture: Agent → Crypto Vault API → Permission Check → Retrieve phone server-side → Squaretalk API → Connect call
// Agent browser receives: customer_id, display_name, call_session_id, status — NOT raw phone number

export type CallState = 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended' | 'failed' | 'unavailable';

export interface CallSession {
  sessionId: string;
  customerId: string;
  displayName: string;
  state: CallState;
  startedAt: string | null;
  duration: number; // seconds
  provider: 'mock' | 'squaretalk';
}

export interface InitiateCallRequest {
  customerId: string;
  agentId: string;
}

export interface InitiateCallResponse {
  success: boolean;
  session: CallSession | null;
  error: string | null;
}

// Provider interface — swap MockCallingProvider for SquaretalkProvider when ready
interface CallingProvider {
  initiateCall(req: InitiateCallRequest): Promise<InitiateCallResponse>;
  endCall(sessionId: string): Promise<{ success: boolean }>;
  muteCall(sessionId: string, muted: boolean): Promise<{ success: boolean }>;
  holdCall(sessionId: string, held: boolean): Promise<{ success: boolean }>;
}

class MockCallingProvider implements CallingProvider {
  async initiateCall(req: InitiateCallRequest): Promise<InitiateCallResponse> {
    // Simulate connecting → ringing → connected flow
    // In production: POST /api/v1/calls/initiate → backend retrieves phone → calls Squaretalk
    const session: CallSession = {
      sessionId: `mock-session-${Date.now()}`,
      customerId: req.customerId,
      displayName: 'Customer', // populated from backend
      state: 'connecting',
      startedAt: null,
      duration: 0,
      provider: 'mock',
    };
    return { success: true, session, error: null };
  }

  async endCall(sessionId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async muteCall(sessionId: string, muted: boolean): Promise<{ success: boolean }> {
    return { success: true };
  }

  async holdCall(sessionId: string, held: boolean): Promise<{ success: boolean }> {
    return { success: true };
  }
}

// Future: class SquaretalkProvider implements CallingProvider { ... }

const provider: CallingProvider = new MockCallingProvider();

export const callingService = {
  async initiateCall(req: InitiateCallRequest): Promise<InitiateCallResponse> {
    // IMPORTANT: Phone number is NEVER sent to the agent browser
    // The backend retrieves the phone number server-side and passes it to Squaretalk
    return provider.initiateCall(req);
  },

  async endCall(sessionId: string): Promise<{ success: boolean }> {
    return provider.endCall(sessionId);
  },

  async muteCall(sessionId: string, muted: boolean): Promise<{ success: boolean }> {
    return provider.muteCall(sessionId, muted);
  },

  async holdCall(sessionId: string, held: boolean): Promise<{ success: boolean }> {
    return provider.holdCall(sessionId, held);
  },
};
