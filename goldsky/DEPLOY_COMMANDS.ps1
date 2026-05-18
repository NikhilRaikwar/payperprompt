# Goldsky Subgraph Deployment Guide
# Run ALL of these commands in your PowerShell terminal (where you ran goldsky login)
# =========================================================================

# STEP 1: Navigate to project
cd "D:\Nikhil Work\kiteai\payperprompt"

# STEP 2: Option A — Instant subgraph (FASTEST, no compilation needed)
# This auto-generates schema + mappings from ABI and deploys immediately
goldsky subgraph init payperprompt/v1 `
  --abi ./goldsky/abis `
  --contract 0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173 `
  --network kite-ai-testnet `
  --contract-name APIRegistry `
  --start-block 0 `
  --contract-events "ServiceRegistered,CallAttested,APICallPaid" `
  --target-path ./goldsky-build `
  --build `
  --deploy

# --- OR ---

# STEP 2: Option B — If the wizard prompts interactively, answer:
#   1. Subgraph name: payperprompt
#   2. Contract address: 0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173
#   3. Network: kite-ai-testnet
#   4. Start block: 0
#   5. Events to index: ServiceRegistered, CallAttested, APICallPaid
#   6. Build? Yes
#   7. Deploy? Yes

# STEP 3: After successful deploy, copy the GraphQL URL from the output
# It will look like:
# https://api.goldsky.com/api/public/project_xxx/subgraphs/payperprompt/v1/gn
#
# Then add it to .env.local:
# NEXT_PUBLIC_GOLDSKY_URL=https://api.goldsky.com/...

# STEP 4: Verify subgraph is syncing
goldsky subgraph list payperprompt/v1

# STEP 5: Test query (replace URL with your actual subgraph URL)
# curl -X POST https://api.goldsky.com/api/public/project_xxx/subgraphs/payperprompt/v1/gn `
#   -H "Content-Type: application/json" `
#   -d '{"query": "{ serviceRegisteredEntities { serviceId name price } }"}'
