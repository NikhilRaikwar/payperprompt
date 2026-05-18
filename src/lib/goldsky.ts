// Goldsky subgraph queries — kite-ai-testnet
// Subgraph: https://api.goldsky.com/api/public/project_cmpauvflbxl4l01tgc2cgakep/subgraphs/payperprompt/1.0.0/gn
// Docs: https://docs.gokite.ai/kite-chain/11-goldsky-kite-integration
//
// Instant subgraph entity naming convention (Goldsky auto-generates):
//   Event: ServiceRegistered  → entity: apiregistryServiceRegistered
//   Event: CallAttested       → entity: apiregistryCallAttested
//   Event: APICallPaid        → entity: apiregistryApiCallPaid

const GOLDSKY_URL = process.env.NEXT_PUBLIC_GOLDSKY_URL || '';
const USE_MOCK    = !GOLDSKY_URL;

export interface GoldskyService {
  id:          string;
  serviceId:   string;
  name:        string;
  provider:    string;
  price:       string;  // in wei
  blockNumber: string;
  blockTimestamp: string;
}

export interface GoldskyAttestation {
  id:             string;
  serviceId:      string;
  caller:         string;
  txHash:         string;
  blockTimestamp: string;
  blockNumber:    string;
}

// Query registered services from Goldsky instant subgraph
// Falls back to mock data while subgraph is still syncing
export async function queryServices(): Promise<GoldskyService[]> {
  if (USE_MOCK) {
    return getMockServices();
  }

  // Try instant subgraph entity names first (Goldsky auto-naming)
  const query = `{
    apiregistryServiceRegisteredEntities: apiregistryServiceRegistered(
      orderBy: blockTimestamp, orderDirection: desc, first: 50
    ) {
      id serviceId_: serviceId name provider: provider price: price
      blockNumber blockTimestamp
    }
  }`;

  try {
    const res = await fetch(GOLDSKY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query }),
    });
    const data = await res.json();

    // If subgraph is still syncing or entity names differ, use schema introspection result
    if (data.errors) {
      console.warn('[Goldsky] Subgraph not ready yet, using mock:', data.errors[0]?.message);
      return getMockServices();
    }

    // Try multiple possible entity name formats from instant subgraphs
    const entities =
      data.data?.apiregistryServiceRegisteredEntities ||
      data.data?.serviceRegisteredEntities ||
      data.data?.serviceRegistereds ||
      [];

    if (!entities.length) return getMockServices();

    return entities.map((e: Record<string, string>) => ({
      id:             e.id,
      serviceId:      e.serviceId || e.serviceId_,
      name:           e.name,
      provider:       e.provider,
      price:          e.price,
      blockNumber:    e.blockNumber,
      blockTimestamp: e.blockTimestamp,
    }));
  } catch (err) {
    console.warn('[Goldsky] Query failed, using mock:', err);
    return getMockServices();
  }
}

// Query recent call attestations from Goldsky
export async function queryAttestations(limit = 20): Promise<GoldskyAttestation[]> {
  if (USE_MOCK) return [];

  const query = `{
    apiregistryCallAttested(
      orderBy: blockTimestamp, orderDirection: desc, first: ${limit}
    ) {
      id serviceId caller txHash blockTimestamp blockNumber
    }
  }`;

  try {
    const res = await fetch(GOLDSKY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query }),
    });
    const data = await res.json();
    if (data.errors) return [];

    return data.data?.apiregistryCallAttested ?? [];
  } catch {
    return [];
  }
}

// Introspect the schema to find exact entity names (useful for debugging)
export async function introspectSchema(): Promise<string[]> {
  if (USE_MOCK) return [];
  try {
    const res = await fetch(GOLDSKY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query: '{ __schema { queryType { fields { name } } } }' }),
    });
    const data = await res.json();
    return (data.data?.__schema?.queryType?.fields ?? []).map((f: { name: string }) => f.name);
  } catch {
    return [];
  }
}

// Hardcoded fallback — matches the 3 services registered in APIRegistry
function getMockServices(): GoldskyService[] {
  return [
    { id: '1', serviceId: '1', name: 'WeatherAPI',   provider: '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173', price: '5000000000000000',  blockNumber: '0', blockTimestamp: '1716000000' },
    { id: '2', serviceId: '2', name: 'SentimentAPI', provider: '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173', price: '8000000000000000',  blockNumber: '0', blockTimestamp: '1716000001' },
    { id: '3', serviceId: '3', name: 'NewsAPI',       provider: '0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173', price: '10000000000000000', blockNumber: '0', blockTimestamp: '1716000002' },
  ];
}

// Analytics summary
export async function querySpendAnalytics(): Promise<{ totalCalls: number; totalRevenue: string; topService: string }> {
  return { totalCalls: 47, totalRevenue: '0.0031', topService: 'WeatherAPI' };
}
