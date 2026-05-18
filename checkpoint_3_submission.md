# 🚀 Checkpoint 3 Submission Writeup: PayPerPrompt

## 1. Project Information
* **Project Name:** PayPerPrompt
* **Tagline:** Stripe for AI Agents — 1-Tap Gasless paid API Marketplace built on Kite Testnet with Agent Passport.
* **Lead Developer:** NIKHIL RAIKWAR
* **Track / Challenge:** Agentic Commerce (Autonomous Payments, Gokite Account Abstraction SDK, Agent Passport, EIP-3009 Gasless Relay)

---

## 2. Project Links
* **Code Repository (GitHub):** `https://github.com/NikhilRaikwar/payperprompt`
* **Live Deployed Demo:** `https://payperprompt.nikhilraikwar.me`
* **Demo Video Link:** `[Insert Loom/YouTube Video Link Here]`
* **Presentation Deck Link:** `[Insert Canva/Google Slides Presentation Link Here]`

---

## 3. Submission Details: Detailed Explanation (Devpost / Hackathon Markdown)

### 💡 The Problem & Opportunity
AI agents are increasingly autonomous, yet they are financially paralyzed. They cannot easily open credit cards, set up bank accounts, or pay for SaaS products. Currently, developers must pre-fund centralized API keys (like OpenAI or weather portals) for their agents, risking catastrophic balance drains if the agent gets stuck in an infinite query loop. 

**PayPerPrompt** solves this by introducing **Agentic Commerce** powered by **Kite's Agent Passport**. We introduce a decentralized, per-prompt paid API marketplace where agents discover API endpoints on-chain, authorize zero-gas spending rules via their secure Passport sessions gaslessly, and pay micro-amounts in PYUSD/USDC atomically only when they execute a prompt. 

---

### 🛠️ What We Did (Core Implementation & Process)
We built a highly scalable, premium-grade dashboard, API gateway, and smart contract registry on the **Kite Testnet (Chain ID 2368)**:

1. **Agent Passport Integration (Spending Sessions):** Integrated Kite's native **Agent Passport** credentials system. Human operators issue a temporary, cryptographically-secure Passport session to the agent (e.g. Agent `0x3f2a`), pre-configuring granular spending limits (e.g., maximum $1.00 USD daily) scoped specifically to authorized providers. This allows the agent to execute autonomous on-chain actions programmatically without prompting manual Metamask signatures for every single call.
2. **On-Chain API Registry (`APIRegistry.sol`):** Deployed a custom registry contract at `0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173` that allows developers to register paid APIs, define tags, configure pricing (e.g., $0.005 per call in PYUSD), and record cryptographic call receipts (Attestations).
3. **EIP-3009 Gasless Payments Relayer:** Constructed a gasless payment pipeline where payments are executed via PyUSD (`0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9`) using `transferWithAuthorization` signatures, routed gaslessly through a Kite Relayer so agents never need native Gas tokens.
4. **Real-Time Data Integration:** Connected the backend weather and crypto sentiment API handlers directly to real-time public APIs (Open-Meteo & CoinGecko) to serve actual live global data on-chain.
5. **Interactive Developer Interface:** Built a state-of-the-art developer console complete with a live LLM-powered query parser, a real-time terminal streaming the complete on-chain attestation path, dynamic session controllers (Revoke, Renew, Extend), and an automated register workspace.

---

### 🎨 Key Achievements & Highlights
* **Agent Passport Autonomy:** Fully enabled autonomous agent execution. Once a human operator approves the Agent Passport spending session budget, the agent acts completely independently with its own signing key.
* **Gasless Execution:** 100% zero gas fees for agents. Relayer subsidizes transaction gas, using EIP-3009 signatures to settle API payments.
* **On-Chain Attestations:** Every API call issues a secure, permanent, verifiable attestation on Kite Testnet, establishing a bulletproof audit trail.
* **Spending Rule Security:** Human operators remain in complete control by defining granular session scopes, revoking keys instantly, and monitoring budget progress bars.
* **100% Custom Premium UI:** Replaced generic default browser dialog alerts with highly premium, sleek dark-mode glassmorphism React modals for pristine brand identity.

---

### 💻 Technical Stack
* **Frontend:** Next.js (TypeScript), Vanilla CSS (Curated HSL dark palette & glassmorphism details).
* **Blockchain & Agent Credentials:** Gokite AA SDK (Agent Passport Spending Sessions), Viem/Wagmi, Ethers.js, EIP-3009 Gasless signature schemes.
* **On-chain Contracts:** Solidity Registry contracts deployed to Kite Testnet (Chain 2368).
* **Backend Gateway Services:** Next.js Route Handlers.
* **Data Sources:** CoinGecko Simple Price API, Open-Meteo Forecast API.
