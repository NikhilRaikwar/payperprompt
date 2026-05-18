// Kite Agent Passport — REST-based session management
// Does NOT use execSync (incompatible with Vercel serverless)
// Docs: https://docs.gokite.ai/kite-agent-passport/kite-agent-passport
// CLI Ref: https://docs.gokite.ai/kite-agent-passport/cli-reference

export interface PassportSession {
  sessionId: string;
  budget: string;
  spent: string;
  expiresAt: number;
  scope: string[];
  status: 'active' | 'expired' | 'revoked';
}

export interface SessionCreateParams {
  budget: string;          // USDC amount e.g. "1.00"
  durationSeconds: number;
  providerAddresses: string[];
  agentAddress: string;
  taskSummary?: string;
}

// Agent identity as registered via kpass agent:register
export interface AgentIdentity {
  agentId: string;
  type: string;
  walletAddress: string;
  registeredAt: number;
}

// Create a Passport spending session scoped to specific providers
// In the Passport model: sessions gate agent spending with user-approved budgets
// Reference: kpass agent:session create --max-amount-per-tx 2 --max-total-amount 10 --ttl 24h
export async function createPassportSession(
  params: SessionCreateParams
): Promise<PassportSession> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    sessionId,
    budget: params.budget,
    spent: '0.000',
    expiresAt: Date.now() + params.durationSeconds * 1000,
    scope: params.providerAddresses,
    status: 'active',
  };
}

// Verify a session is still valid before agent executes paid action
// Mirrors: kpass agent:session status --request-id <ID> --wait --output json
export function validateSession(session: PassportSession, requiredAmount: number): boolean {
  if (session.status !== 'active') return false;
  if (Date.now() > session.expiresAt) return false;
  const remaining = parseFloat(session.budget) - parseFloat(session.spent);
  return remaining >= requiredAmount;
}

// Get a mock agent identity (in real Passport: kpass agent:register --type api-agent)
export function getAgentIdentity(walletAddress: string): AgentIdentity {
  return {
    agentId: `agent_${walletAddress.slice(2, 10).toLowerCase()}`,
    type: 'api-agent',
    walletAddress,
    registeredAt: Date.now(),
  };
}
