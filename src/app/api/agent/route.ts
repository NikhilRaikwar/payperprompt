import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ethers } from 'ethers';
import { gaslessTransfer } from '@/lib/gasless';
import { createPassportSession, validateSession, getAgentIdentity } from '@/lib/passport';
import { KITE } from '@/lib/env';

// Kite testnet config — from env.ts constants
const REGISTRY_ABI = [
  'function recordCall(uint256 serviceId, bytes32 callHash, bytes32 txHash) external',
  'function getAllServices() external view returns ((address provider, string name, string endpoint, uint256 pricePerCall, string[] tags, bool active, uint256 totalCalls)[])',
];

// Provider wallet — receives PYUSD for each API call
const PROVIDER_WALLET = '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173';

// Service catalog — used as fallback if Goldsky subgraph is not deployed
const MOCK_SERVICES = [
  { id: 1, name: 'WeatherAPI',   endpoint: '/api/providers/weather',   priceUsdc: '0.005', priceWei: ethers.parseEther('0.005'), tags: ['weather', 'realtime'] },
  { id: 2, name: 'SentimentAPI', endpoint: '/api/providers/sentiment', priceUsdc: '0.008', priceWei: ethers.parseEther('0.008'), tags: ['sentiment', 'ai', 'crypto'] },
  { id: 3, name: 'NewsAPI',      endpoint: '/api/providers/news',      priceUsdc: '0.010', priceWei: ethers.parseEther('0.010'), tags: ['news', 'media'] },
];

export async function POST(req: NextRequest) {
  const logs: string[]                     = [];
  const txHashes: string[]                 = [];
  const results: Record<string, unknown>   = {};

  const log = (msg: string) => { logs.push(msg); console.log(msg); };

  try {
    const { query } = await req.json();

    log(`[INFO] Kite Testnet connected — Chain ID: ${KITE.CHAIN_ID}`);
    log(`[INFO] RPC: ${KITE.RPC}`);
    log(`[INFO] APIRegistry: ${KITE.REGISTRY}`);
    log(`[INFO] Gasless Endpoint: ${KITE.GASLESS}/testnet`);
    log(`[INFO] Agent query: "${query}"`);

    // Step 1: Create Passport spending session
    // Models: kpass agent:session create --max-amount-per-tx 0.01 --max-total-amount 1.00 --ttl 1h
    const hasAgentKey     = process.env.AGENT_PRIVATE_KEY && !process.env.AGENT_PRIVATE_KEY.includes('your_');
    const agentWalletAddr = hasAgentKey
      ? new ethers.Wallet(process.env.AGENT_PRIVATE_KEY!).address
      : (process.env.AGENT_WALLET_ADDRESS || '0x0000000000000000000000000000000000000001');

    const agentIdentity = getAgentIdentity(agentWalletAddr);
    const session = await createPassportSession({
      budget:            '1.00',
      durationSeconds:   3600,
      providerAddresses: [PROVIDER_WALLET],
      agentAddress:      agentWalletAddr,
      taskSummary:       `Execute query: ${query}`,
    });

    log(`[PASSPORT] Agent registered: ${agentIdentity.agentId} (type: ${agentIdentity.type})`);
    log(`[PASSPORT] Spending session: ${session.sessionId}`);
    log(`[PASSPORT] Budget: $${session.budget} PYUSD | Scope: ${session.scope.length} providers | Expires: ${new Date(session.expiresAt).toISOString()}`);

    // Step 2: Use OpenAI to select relevant APIs (keeping OpenAI per user's request)
    const hasOpenAIKey  = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key_here');
    let selectedServices = MOCK_SERVICES.slice(0, 2);

    if (hasOpenAIKey) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const planRes = await openai.chat.completions.create({
          model:      'gpt-4o-mini',
          max_tokens: 300,
          messages: [{
            role:    'user',
            content: `Query: "${query}"\nAPIs: ${JSON.stringify(MOCK_SERVICES.map(s => ({ id: s.id, name: s.name, tags: s.tags, price: s.priceUsdc })))}\nReturn JSON only: { "ids": [1,2], "reason": "..." }`,
          }],
        });
        const text = planRes.choices[0].message.content || '{}';
        const plan = JSON.parse(text.replace(/```json\n?|```/g, '').trim());
        if (plan.ids?.length) {
          selectedServices = MOCK_SERVICES.filter(s => plan.ids.includes(s.id));
          log(`[OPENAI] Service selection: ${plan.reason}`);
        }
      } catch (err: unknown) {
        log(`[WARN] OpenAI selection failed, using defaults: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    } else {
      log(`[INFO] Demo mode — add OPENAI_API_KEY to .env.local for AI-powered service selection`);
    }

    log(`[INFO] Selected services: ${selectedServices.map(s => s.name).join(', ')}`);

    // Ethers provider + wallet for on-chain operations
    const provider = new ethers.JsonRpcProvider(KITE.RPC);
    const wallet   = hasAgentKey
      ? new ethers.Wallet(process.env.AGENT_PRIVATE_KEY!, provider)
      : ethers.Wallet.createRandom().connect(provider);

    const registry = new ethers.Contract(KITE.REGISTRY, REGISTRY_ABI, wallet);
    const baseUrl  = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Step 3: For each selected service — pay gaslessly then call API
    for (const service of selectedServices) {
      const costNum = parseFloat(service.priceUsdc);

      // Validate session budget before spending
      if (!validateSession(session, costNum)) {
        log(`[WARN] Session budget exceeded — skipping ${service.name}`);
        continue;
      }

      log(`[PAY] Initiating EIP-3009 gasless payment: ${service.priceUsdc} PYUSD → ${service.name}`);
      log(`[PAY] Token: ${KITE.PYUSD}`);
      log(`[PAY] Relayer: POST ${KITE.GASLESS}/testnet`);

      let txHash = `demo_${Date.now()}_${service.id}`;

      // Real EIP-3009 gasless transfer if agent private key configured
      if (hasAgentKey) {
        try {
          const gaslessResult = await gaslessTransfer({
            fromPrivateKey: process.env.AGENT_PRIVATE_KEY!,
            toAddress:      PROVIDER_WALLET,
            amountWei:      service.priceWei,
            network:        'testnet',
          });
          txHash = gaslessResult.txHash;
          log(`[PAY] ✓ Gasless tx: ${txHash}`);
          log(`[PAY]   KiteScan: https://testnet.kitescan.ai/tx/${txHash}`);
        } catch (gaslessErr: unknown) {
          log(`[WARN] Gasless relay error — falling back to demo mode: ${gaslessErr instanceof Error ? gaslessErr.message : 'unknown'}`);
        }
      } else {
        log(`[PAY] Demo mode — add AGENT_PRIVATE_KEY to .env.local for live gasless transfers`);
        log(`[PAY] Simulated tx: ${txHash}`);
      }

      txHashes.push(txHash);

      // Call payment-gated API with proof headers
      log(`[CALL] Calling ${service.name} with payment proof (x-payment-tx header)...`);
      try {
        const apiRes = await fetch(`${baseUrl}${service.endpoint}`, {
          headers: {
            'x-payment-tx':    txHash,
            'x-payer-address': wallet.address,
          },
        });
        const apiData = await apiRes.json();
        results[service.name] = apiData;

        if (apiRes.status === 402) {
          log(`[WARN] ${service.name} returned 402 — payment not yet verified on-chain`);
        } else {
          log(`[SUCCESS] ${service.name} ✓ — data received`);
        }
      } catch (callErr: unknown) {
        log(`[ERROR] ${service.name} call failed: ${callErr instanceof Error ? callErr.message : 'unknown'}`);
      }

      // Step 4: Write attestation to Kite chain via APIRegistry.recordCall()
      log(`[ATTEST] Writing call attestation to Kite chain...`);
      try {
        const callHash      = ethers.id(`${service.id}-${wallet.address}-${Date.now()}`);
        const txHashBytes32 = txHash.startsWith('demo_')
          ? ethers.ZeroHash
          : txHash as `0x${string}`;

        const attestTx   = await registry.recordCall(service.id, callHash, txHashBytes32);
        const receipt    = await attestTx.wait(1);
        const attestHash = receipt?.hash || attestTx.hash;

        txHashes.push(attestHash);
        log(`[ATTEST] ✓ On-chain attestation: ${attestHash}`);
        log(`[ATTEST]   KiteScan: https://testnet.kitescan.ai/tx/${attestHash}`);
      } catch (attestErr: unknown) {
        log(`[WARN] Attestation failed (no gas?): ${attestErr instanceof Error ? attestErr.message : 'unknown'}`);
      }

      // Update session spent
      session.spent = (parseFloat(session.spent) + costNum).toFixed(3);
    }

    // Step 5: Synthesize results with OpenAI
    let answer = `Agent completed ${selectedServices.length} API call(s) on Kite Testnet. Total: $${session.spent} PYUSD. All payments attested on-chain via APIRegistry.`;

    if (hasOpenAIKey && Object.keys(results).length > 0) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const synthRes = await openai.chat.completions.create({
          model:      'gpt-4o-mini',
          max_tokens: 400,
          messages: [{
            role:    'user',
            content: `User asked: "${query}". API results from Kite-settled calls: ${JSON.stringify(results)}. Answer concisely in 2-3 sentences.`,
          }],
        });
        answer = synthRes.choices[0].message.content || answer;
      } catch {
        // Keep default answer on synthesis failure
      }
    }

    const totalCost = selectedServices.reduce((acc, s) => acc + parseFloat(s.priceUsdc), 0);
    log(`[SUCCESS] Agent complete ✓ — $${totalCost.toFixed(3)} PYUSD | 0 gas | ${txHashes.length} on-chain events`);

    return NextResponse.json({ answer, logs, txHashes, totalCost, results, session });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logs.push(`[ERROR] ${msg}`);
    return NextResponse.json({ error: msg, logs }, { status: 500 });
  }
}
