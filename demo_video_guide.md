# 🎥 PayPerPrompt — Demo Video Recording Guide & Script
> **Kite AI Global Hackathon 2026 — Track: Agentic Commerce**  
> **Target Video Length:** 3:00 Minutes (Sweet Spot: 2:50 - 3:20)

---

## 🏆 Key Checklist: What Judges MUST See
Before recording, verify these **5 critical dimensions** are clearly displayed:
1. **AI Agent Autonomy:** The agent executing the prompt autonomously in a streaming terminal UI.
2. **Paid Actions Flow:** Showing that the agent executes gated API endpoints with real-world PYUSD costs.
3. **Kite Settlement:** Gasless EIP-3009 payment transaction settled on Kite Testnet with a clickable KiteScan explorer link.
4. **Verifiable Proof:** On-chain call attestations logged in real-time under the **Attestations** tab.
5. **Interactive UI/UX:** A stunning, premium dark-mode interface showing real-world utility.

---

## ⏱️ Video Timeline & Visual Flow

| Time Range | Section | Screen Visuals | Voiceover Focus |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:20** | **Hook** | Landing Page hero banner scrolling smoothly to the custom styled Architecture code carousel. | Introduce PayPerPrompt as the *"Stripe for AI Agents."* |
| **0:20 – 0:45** | **The Problem** | Highlighting the three core gaps: Agent tool execution, payment friction, and lack of verifiable receipts. | Explain why subscription models fail autonomous machine-to-machine commerce. |
| **0:45 – 1:15** | **The Solution** | Live scroll through the interactive architecture carousel, hovering over the dynamic EIP-3009 and AA SDK cards. | Walk through the discovery, spending rules, gasless settlement, and attestation lifecycle. |
| **1:15 – 2:20** | **Live Product Demo** | Active wallet connection, typing the multi-trigger prompt, clicking `RUN AGENT`, watching logs stream, and showing **Sessions** / **Attestations** updates. | **Core of the video.** Highlighting the autonomous loop, gasless relayer, and on-chain verification. |
| **2:20 – 2:50** | **Kite Deep Integration** | Zooming in on the **Kite AA Spending Rules** block and clicking the **"Chain Status ↗"** `/api/health` button. | Detail Goldsky query, Gokite AA SDK limits, gasless PyUSD, and smart contracts registry. |
| **2:50 – 3:20** | **Closing** | Back to Landing Page hero showing clear live demo and GitHub URLs. | Summarize economic potential and sign off with clear links. |

---

## 🎙️ Word-by-Word Voiceover Script

### 🎬 Section 1: Hook (0:00 - 0:20)
* **[Screen Visuals]** Start on the Landing Page. Do a slow, smooth scroll down from the glowing logo to the headline. Highlight the sub-tag **"Stripe for AI Agents."**
* **[Voiceover]** 
  > *"Hi, this is PayPerPrompt — the first autonomous API registry and execution marketplace built on the Kite Network. Think of it as 'Stripe for AI Agents.' It allows autonomous agents to discover premium developer APIs, pay per call gaslessly in PYUSD, execute workflows, and record every single action on-chain with verifiable receipts."*

---

### 🔍 Section 2: The Problem (0:20 - 0:45)
* **[Screen Visuals]** Scroll down to the **"Core Gaps"** or features grid section of the landing page. Point the cursor at the cards detailing Payment Friction and Auditing.
* **[Voiceover]**
  > *"Today, AI agents can think, plan, and call tools. But they have a major limitation: they cannot natively discover paid services, handle real-time micropayments, and leave a trustworthy audit trail. Existing API subscription models are designed for humans with credit cards, not for autonomous machine-to-machine commerce."*

---

### 🏗️ Section 3: The Solution & Architecture (0:45 - 1:15)
* **[Screen Visuals]** Scroll to the **"Built directly from Kite Docs"** Architecture carousel. Hover/click through the tabs: *Kite Config*, *Passport Session*, *EIP-3009*, and *AA SDK*. Let the gorgeous highlighted JSX code blocks take center stage.
* **[Voiceover]**
  > *"PayPerPrompt solves this by turning APIs into agent-native economic primitives. The lifecycle is atomic: an agent discovers a service via a Goldsky GraphQL query, gets a scoped budget session via the Gokite AA SDK, pays gaslessly in PYUSD using EIP-3009 signatures, calls the API endpoint, and posts a secure cryptographic attestation on-chain."*

---

### ⚡ Section 4: Live Product Demo (1:15 - 2:20)
* **[Screen Visuals]** Click **"Connect Wallet"** to log into the Dashboard. Go to the **Run Agent** tab.
* **[Voiceover]**
  > *"Let's see this in action. I'm connecting my Passport wallet to the PayPerPrompt dashboard. We are on the Kite Testnet, using PYUSD as the settlement token. I'm going to enter a multi-intent query in the Agent console: 'Get me today's ETH price and BTC sentiment.' Let's hit 'Run Agent'."*

* **[Screen Visuals]** Click `RUN AGENT`. A MetaMask/wallet popup appears. Confirm the transaction. Keep the camera calm as logs stream.
* **[Voiceover]**
  > *"Here is the autonomous loop running. First, the agent queries our Goldsky registry and discovers CryptoPriceAPI and SentimentAPI. It prompts me for a one-time wallet signature to authorize a Passport spending session with a one-dollar budget limit. Once signed, the agent takes over."*

* **[Screen Visuals]** Point the cursor at the logs:
  - *EIP-3009 Gasless Transfer settled*
  - *KiteScan txHash hyperlink*
  - *API responses printed in logs*
* **[Voiceover]**
  > *"Look at the terminal. The agent generates EIP-3009 transfer authorizations for both endpoints, settling them gaslessly via gasless.gokite.ai. The API responses stream back instantly. Finally, the agent logs an immutable attestation to the APIRegistry contract."*

* **[Screen Visuals]** Switch to the **Sessions** tab, then the **Attestations** tab.
* **[Voiceover]**
  > *"In the Sessions tab, we can see our active scopes and remaining budget dynamically updated. In the Attestations tab, every single call is recorded permanently on-chain. If I click the transaction link, it opens the KiteScan explorer, showing the live transaction receipt. Complete auditability, zero friction."*

---

### 🛡️ Section 5: Why Kite Matters & Deep Integration (2:20 - 2:50)
* **[Screen Visuals]** Open the **Sessions** tab again, focusing on the **Kite AA Spending Rules** code card at the bottom. Click the glowing green **"Chain Status ↗"** button in the header top bar.
* **[Voiceover]**
  > *"What makes this project unique is how deeply it integrates with Kite. We aren't just using the chain as a database. We rely on Goldsky for API discovery, the Gokite AA SDK to enforce spending limits, gasless relayer endpoints for frictionless payments, and customized Solidity smart contracts to registry services and secure on-chain receipts."*

---

### 🏁 Section 6: Closing & Actionable Call (2:50 - 3:20)
* **[Screen Visuals]** Go back to the Landing Page hero section. Hover over the button showing the live URL: `payperprompt.nikhilraikwar.me` and the GitHub link.
* **[Voiceover]**
  > *"PayPerPrompt bridges the gap between AI autonomy and secure web3 commerce. It is Stripe, built for the agentic economy on Kite. You can try the live demo today at payperprompt.nikhilraikwar.me and audit the complete open-source codebase on GitHub. Thank you so much!"*

---

## 🎥 Screen Recording Tips for High-Fidelity Output
1. **Resolution:** Record at a clean `1080p` aspect ratio. Avoid ultra-wide monitors as text becomes too small to read on YouTube/judging portals.
2. **Browser Zoom:** Set browser zoom to `110%` or `120%` so the Space Mono code fonts and log lines are highly visible.
3. **Smooth Cursor Motion:** Move the cursor slowly and intentionally. Use a subtle highlight effect around the cursor if using recording software like Camtasia or Loom.
4. **No Dead Air:** If the wallet transaction confirmation takes a few seconds, use that time to explain what is happening under the hood (e.g. *"The gasless relayer is packaging our EIP-712 signature into an on-chain transaction"*).
5. **Background Music:** Keep the voiceover crisp, clean, and dominant. If you add background music, keep it at a low volume level (e.g., `-20dB` ambient lofi beats).
