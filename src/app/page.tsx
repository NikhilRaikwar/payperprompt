'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Page() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [activeArchIdx, setActiveArchIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  // Config arrays for architecture code panels
  const ARCH_CODES = [
    (
      <>
        <div><span className="c-comment">// 1. RPC Configuration for Kite Testnet</span></div>
        <div><span className="c-keyword">const</span> <span className="c-var">KITE_TESTNET</span> = {`{`}</div>
        <div>&nbsp;&nbsp;<span className="c-white">chainId:</span> <span className="c-num">2368</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">name:</span> <span className="c-string">'Kite Testnet'</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">rpcUrl:</span> <span className="c-string">'https://rpc-testnet.gokite.ai'</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">explorer:</span> <span className="c-string">'https://testnet.kitescan.ai'</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">faucet:</span> <span className="c-string">'https://faucet.gokite.ai'</span></div>
        <div>{`}`};</div>
        <div>&nbsp;</div>
        <div><span className="c-keyword">const</span> <span className="c-var">provider</span> = <span className="c-keyword">new</span> <span className="c-var">ethers</span>.<span className="c-fn">JsonRpcProvider</span>(<span className="c-var">KITE_TESTNET</span>.rpcUrl);</div>
        <div><span className="c-keyword">const</span> <span className="c-var">blockNumber</span> = <span className="c-keyword">await</span> <span className="c-var">provider</span>.<span className="c-fn">getBlockNumber</span>();</div>
        <div><span className="c-var">console</span>.<span className="c-fn">log</span>(<span className="c-string">`Connected to Kite Testnet block: $`</span>{`{`}<span className="c-var">blockNumber</span>{`}`}<span className="c-string">`</span>);</div>
      </>
    ),

    (
      <>
        <div><span className="c-comment">// 2. Agent Passport — spending session</span></div>
        <div><span className="c-keyword">const</span> <span className="c-var">session</span> = <span className="c-keyword">await</span> <span className="c-fn">createPassportSession</span>({`{`}</div>
        <div>&nbsp;&nbsp;<span className="c-white">budget:</span> <span className="c-string">'1.00'</span>,             <span className="c-comment">// $1.00 PYUSD spending limit</span></div>
        <div>&nbsp;&nbsp;<span className="c-white">durationSeconds:</span> <span className="c-num">3600</span>,      <span className="c-comment">// TTL: 1 hour</span></div>
        <div>&nbsp;&nbsp;<span className="c-white">providerAddresses:</span> [<span className="c-string">'0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173'</span>],</div>
        <div>&nbsp;&nbsp;<span className="c-white">agentAddress:</span> <span className="c-string">'0x3f2a356c7d8e9f0a1b2c3d4e5f6a7b8c91'</span></div>
        <div>{`}`});</div>
        <div>&nbsp;</div>
        <div><span className="c-comment">// Verify spending rules before making the call</span></div>
        <div><span className="c-keyword">const</span> <span className="c-var">isAuthorized</span> = <span className="c-fn">validateSession</span>(session, <span className="c-num">0.005</span>);</div>
        <div><span className="c-keyword">if</span> (!isAuthorized) {`{`}</div>
        <div>&nbsp;&nbsp;<span className="c-keyword">throw</span> <span className="c-keyword">new</span> <span className="c-fn">Error</span>(<span className="c-string">"Passport budget limit exceeded!"</span>);</div>
        <div>{`}`}</div>
      </>
    ),

    (
      <>
        <div><span className="c-comment">// 3. EIP-3009 TransferWithAuthorization signature</span></div>
        <div><span className="c-keyword">const</span> <span className="c-var">domain</span> = {`{`}</div>
        <div>&nbsp;&nbsp;<span className="c-white">name:</span> <span className="c-string">'PYUSD'</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">version:</span> <span className="c-string">'1'</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">chainId:</span> <span className="c-num">2368</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">verifyingContract:</span> <span className="c-string">'0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9'</span></div>
        <div>{`}`};</div>
        <div>&nbsp;</div>
        <div><span className="c-keyword">const</span> <span className="c-var">message</span> = {`{`}</div>
        <div>&nbsp;&nbsp;<span className="c-white">from:</span> account,</div>
        <div>&nbsp;&nbsp;<span className="c-white">to:</span> providerAddress,</div>
        <div>&nbsp;&nbsp;<span className="c-white">value:</span> <span className="c-fn">parseUnits</span>(<span className="c-string">'0.005'</span>, <span className="c-num">18</span>),</div>
        <div>&nbsp;&nbsp;<span className="c-white">validAfter:</span> now - <span className="c-num">5</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">validBefore:</span> now + <span className="c-num">25</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-white">nonce:</span> <span className="c-fn">randomBytes</span>(<span className="c-num">32</span>)</div>
        <div>{`}`};</div>
        <div>&nbsp;</div>
        <div><span className="c-comment">// POST signature to gasless relayer</span></div>
        <div><span className="c-keyword">const</span> <span className="c-var">txHash</span> = <span className="c-keyword">await</span> <span className="c-fn">submitToRelayer</span>(domain, message, signature);</div>
      </>
    ),

    (
      <>
        <div><span className="c-comment">// 4. AA SDK constructor and vault proxy deployment</span></div>
        <div><span className="c-keyword">import</span> {`{ GokiteAASDK }`} <span className="c-keyword">from</span> <span className="c-string">'gokite-aa-sdk'</span>;</div>
        <div>&nbsp;</div>
        <div><span className="c-keyword">const</span> <span className="c-var">sdk</span> = <span className="c-keyword">new</span> <span className="c-fn">GokiteAASDK</span>(</div>
        <div>&nbsp;&nbsp;<span className="c-string">'kite_testnet'</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-string">'https://rpc-testnet.gokite.ai'</span>,</div>
        <div>&nbsp;&nbsp;<span className="c-string">'https://bundler-service.staging.gokite.ai/rpc/'</span></div>
        <div>);</div>
        <div>&nbsp;</div>
        <div><span className="c-comment">// Configure ClientAgentVault UUPS proxy rules</span></div>
        <div><span className="c-keyword">const</span> <span className="c-var">tx</span> = <span className="c-keyword">await</span> <span className="c-fn">configureSpendingRules</span>(sdk, {`{`}</div>
        <div>&nbsp;&nbsp;<span className="c-white">timeWindow:</span> <span className="c-num">3600n</span>, <span className="c-comment">// Hourly window</span></div>
        <div>&nbsp;&nbsp;<span className="c-white">budget:</span> <span className="c-var">ethers</span>.<span className="c-fn">parseUnits</span>(<span className="c-string">'1'</span>, <span className="c-num">18</span>),</div>
        <div>&nbsp;&nbsp;<span className="c-white">targetProviders:</span> [<span className="c-string">'0x4a9B3AFCbdCb38420fE4cADb9Cf0257c282fe173'</span>]</div>
        <div>{`}`});</div>
      </>
    ),

    (
      <>
        <div><span className="c-comment"># 5. GraphQL query to Goldsky to discover services</span></div>
        <div><span className="c-keyword">query</span> <span className="c-fn">DiscoverAPIs</span> {`{`}</div>
        <div>&nbsp;&nbsp;<span className="c-var">serviceRegisteredEntities</span>(</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="c-white">where:</span> {`{`} <span className="c-white">tags_contains:</span> [<span className="c-string">"weather"</span>], <span className="c-white">active:</span> <span className="c-keyword">true</span> {`}`}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="c-white">orderBy:</span> pricePerCall</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="c-white">orderDirection:</span> asc</div>
        <div>&nbsp;&nbsp;) {`{`}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;id</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;provider</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;name</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;endpoint</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;pricePerCall</div>
        <div>&nbsp;&nbsp;{`}`}</div>
        <div>{`}`}</div>
      </>
    )
  ];

  const ARCH_METADATA = [
    { filename: 'kite-config.ts', lang: 'TypeScript' },
    { filename: 'passport-session.ts', lang: 'TypeScript' },
    { filename: 'eip3009-signer.ts', lang: 'TypeScript' },
    { filename: 'gokite-aa-setup.ts', lang: 'TypeScript' },
    { filename: 'goldsky-query.graphql', lang: 'GraphQL' }
  ];

  // Auto-play interval for architecture carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveArchIdx((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Infinite simulation script loop for the live terminal block
  useEffect(() => {
    const steps = [
      { text: "> node agent.js", delay: 1000 },
      { text: "🔍 Discovering APIs via Goldsky Subgraph...", delay: 1500 },
      { text: "✓ Found WeatherAPI ($0.005 PYUSD/call) at 0x4a9B...173", delay: 1800 },
      { text: "🛂 Creating scoped Passport spending session...", delay: 1800 },
      { text: "✓ Session approved (max_amount: $1.00 PYUSD)", delay: 1500 },
      { text: "⚡ Generating EIP-3009 transfer signature...", delay: 1500 },
      { text: "⛽ POSTing gasless transfer to relayer...", delay: 1800 },
      { text: "✓ Gasless PYUSD transfer settled. tx: 0x51c5...692b", delay: 1500 },
      { text: "📡 Calling weather API endpoint with payment proof...", delay: 1500 },
      { text: "✓ WeatherAPI responded: New York 21°C, Partly Cloudy", delay: 1500 },
      { text: "🔗 Posting call attestation to Kite Registry...", delay: 1800 },
      { text: "✓ Attestation confirmed. tx: 0xcbce...f0e6", delay: 2000 },
      { text: "🎉 Autonomous execution completed successfully!", delay: 4000 }
    ];

    let timer: NodeJS.Timeout;
    
    const runStep = (index: number) => {
      if (index === 0) {
        setTerminalLines([steps[0].text]);
      } else {
        setTerminalLines((prev) => [...prev, steps[index].text]);
      }

      const nextIndex = (index + 1) % steps.length;
      timer = setTimeout(() => {
        runStep(nextIndex);
      }, steps[index].delay);
    };

    runStep(0);

    return () => clearTimeout(timer);
  }, []);

  // Initialize body styles on mount to ensure scrolling is fully functional on landing page
  useEffect(() => {
    document.body.style.background = '#030712';
    document.body.style.color = '#f8fafc';
    document.body.style.fontFamily = "'Syne', sans-serif";
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    document.body.style.display = 'block';
    document.body.style.cursor = 'default';
  }, []);

  // Redirect on successful wallet connection
  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  // Visual script loops: Scroll reveals
  useEffect(() => {
    // Reveal elements on scroll using Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #030712;
          --bg2: #0a0f1e;
          --bg3: #0f172a;
          --green: #00ff88;
          --green2: #00cc6a;
          --green-dim: rgba(0,255,136,0.12);
          --green-glow: rgba(0,255,136,0.06);
          --blue: #3b82f6;
          --white: #f8fafc;
          --muted: #64748b;
          --border: rgba(255,255,255,0.06);
          --border2: rgba(0,255,136,0.2);
          --mono: 'Space Mono', monospace;
          --display: 'Syne', sans-serif;
        }

        /* Custom scrollbar to match dark premium theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: var(--bg);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--bg3);
          border: 1px solid var(--border);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }

        /* Custom cursor styling */
        .cursor {
          width: 8px; height: 8px;
          background: var(--green);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.1s;
          mix-blend-mode: difference;
        }
        .cursor-ring {
          width: 32px; height: 32px;
          border: 1px solid var(--green);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9998;
          transition: all 0.15s ease;
          opacity: 0.5;
        }

        /* Grid Background patterns */
        .grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }
        .noise {
          position: fixed; inset: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        /* Navigation Header */
        nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 20px 60px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(20px);
          background: rgba(3,7,18,0.8);
        }
        .nav-logo {
          font-family: var(--display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.01em;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .nav-logo .pay { color: #ffffff; }
        .nav-logo .slash { color: rgba(255,255,255,0.15); font-weight: 300; font-family: var(--mono); }
        .nav-logo .per {
          background: linear-gradient(135deg, #00d2ff 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav-logo .prompt {
          background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav-links { display: flex; gap: 40px; list-style: none; }
        .nav-links a {
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--white); }
        .nav-cta {
          font-family: var(--mono);
          font-size: 12px;
          padding: 8px 20px;
          border: 1px solid var(--green);
          color: var(--green);
          text-decoration: none;
          letter-spacing: 0.06em;
          transition: all 0.2s;
          background: transparent;
          cursor: pointer;
        }
        .nav-cta:hover { background: var(--green); color: var(--bg); }

        /* Hero Landing */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 120px 60px 80px;
          position: relative;
          z-index: 1;
        }
        .hero-inner { max-width: 1100px; width: 100%; }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--green);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 32px;
          padding: 6px 14px;
          border: 1px solid var(--border2);
          background: var(--green-dim);
        }
        .hero-eyebrow::before {
          content: '';
          width: 6px; height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .hero-headline {
          font-size: clamp(52px, 7vw, 96px);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.03em;
          margin-bottom: 32px;
        }
        .hero-headline .line1 { display: block; color: var(--white); }
        .hero-headline .line2 { display: block; color: var(--green); }
        .hero-headline .line3 {
          display: block;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
        .hero-sub {
          font-family: var(--mono);
          font-size: 15px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 560px;
          margin-bottom: 48px;
        }
        .hero-sub em { color: var(--white); font-style: normal; }
        .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        
        .btn-primary {
          font-family: var(--mono);
          font-size: 13px;
          padding: 14px 32px;
          background: var(--green);
          color: var(--bg);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-decoration: none;
          transition: all 0.2s;
          border: none; cursor: pointer;
          display: inline-block;
        }
        .btn-primary:hover { background: var(--green2); transform: translateY(-1px); }
        .btn-secondary {
          font-family: var(--mono);
          font-size: 13px;
          padding: 13px 32px;
          background: transparent;
          color: var(--white);
          letter-spacing: 0.06em;
          text-decoration: none;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: var(--white); }
        .hero-stat-row {
          display: flex; gap: 48px; margin-top: 80px;
          padding-top: 48px;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .hero-stat .num {
          font-size: 36px; font-weight: 800;
          color: var(--green);
          font-family: var(--mono);
          letter-spacing: -0.02em;
        }
        .hero-stat .label {
          font-size: 12px; color: var(--muted);
          letter-spacing: 0.06em;
          margin-top: 4px;
        }
        .hero-visual {
          position: absolute;
          right: 60px; top: 50%;
          transform: translateY(-50%);
          width: 420px;
        }
        @media (max-width: 1100px) { .hero-visual { display: none; } }

        /* Embedded Interactive Terminal code visualizer */
        .terminal {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          font-family: var(--mono);
          font-size: 12px;
        }
        .terminal-bar {
          background: #1e293b;
          padding: 10px 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .terminal-dot { width: 10px; height: 10px; border-radius: 50%; }
        .terminal-body { padding: 20px; line-height: 1.8; }
        .t-muted { color: var(--muted); }
        .t-green { color: var(--green); }
        .t-white { color: var(--white); }
        .t-blue { color: #60a5fa; }
        .t-yellow { color: #fbbf24; }
        .t-keyword { color: #93c5fd; }
        .t-var { color: #fbbf24; }
        .t-fn { color: var(--green); }
        .t-string { color: #86efac; }
        .typing::after {
          content: '|';
          animation: blink 1s infinite;
          color: var(--green);
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* Steps visual guides */
        .flow-section {
          padding: 120px 60px;
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
        }
        .section-label {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--green);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: clamp(36px, 4vw, 56px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 64px;
        }
        .flow-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        .flow-step {
          background: var(--bg2);
          border: 1px solid var(--border);
          padding: 32px;
          position: relative;
          transition: border-color 0.3s, background 0.3s;
        }
        .flow-step:hover {
          border-color: var(--border2);
          background: var(--bg3);
        }
        .flow-step::before {
          content: attr(data-num);
          font-family: var(--mono);
          font-size: 11px;
          color: var(--green);
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 20px;
        }
        .flow-step-icon {
          width: 40px; height: 40px;
          background: var(--green-dim);
          border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 18px;
        }
        .flow-step h3 {
          font-size: 18px; font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .flow-step p {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--muted);
          line-height: 1.7;
        }
        .flow-step .kite-tag {
          display: inline-flex;
          margin-top: 16px;
          font-family: var(--mono);
          font-size: 10px;
          padding: 3px 8px;
          background: var(--green-dim);
          color: var(--green);
          letter-spacing: 0.08em;
          border: 1px solid var(--border2);
        }

        /* Tech integrations architecture */
        .arch-section {
          padding: 80px 60px 120px;
          position: relative; z-index: 1;
          background: var(--bg2);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .arch-inner { max-width: 1200px; margin: 0 auto; }
        .arch-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
          margin-top: 64px;
        }
        .code-block {
          background: var(--bg);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .code-header {
          background: #1e293b;
          padding: 10px 20px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }
        .code-filename { font-family: var(--mono); font-size: 11px; color: var(--muted); }
        .code-lang { font-family: var(--mono); font-size: 10px; color: var(--green); background: var(--green-dim); padding: 2px 8px; }
        .code-body {
          padding: 24px;
          font-family: var(--mono);
          font-size: 12px;
          line-height: 1.8;
          overflow-x: auto;
        }
        .c-comment { color: #475569; }
        .c-keyword { color: #93c5fd; }
        .c-string { color: #86efac; }
        .c-fn { color: var(--green); }
        .c-var { color: #fbbf24; }
        .c-num { color: #f472b6; }
        .arch-features { display: flex; flex-direction: column; gap: 24px; }
        .arch-feature {
          display: flex; gap: 20px; align-items: flex-start;
          padding: 20px;
          background: var(--bg);
          border: 1px solid var(--border);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .arch-feature:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }
        .arch-feature.active {
          border-color: var(--green);
          background: rgba(0, 255, 136, 0.04);
        }
        .arch-feature-progress {
          position: absolute;
          bottom: 0; left: 0; height: 2px;
          background: var(--green);
          width: 0%;
        }
        .arch-feature.active .arch-feature-progress {
          animation: fillProgress 5s linear forwards;
        }
        @keyframes fillProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .af-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          background: var(--green-dim);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .af-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .af-desc { font-family: var(--mono); font-size: 11px; color: var(--muted); line-height: 1.6; }

        /* Kite components stack */
        .primitives-section {
          padding: 120px 60px;
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
        }
        .primitives-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2px;
          margin-top: 64px;
        }
        .primitive-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          padding: 28px 20px;
          text-align: center;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .primitive-card::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: var(--green);
          transform: scaleX(0);
          transition: transform 0.3s;
        }
        .primitive-card:hover::before { transform: scaleX(1); }
        .primitive-card:hover { background: var(--bg3); border-color: var(--border2); }
        .primitive-icon { font-size: 28px; margin-bottom: 12px; }
        .primitive-name {
          font-size: 13px; font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .primitive-desc {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* Demo node visualizations */
        .demo-section {
          background: var(--bg2);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 120px 60px;
          position: relative; z-index: 1;
        }
        .demo-inner { max-width: 900px; margin: 0 auto; text-align: center; }
        .demo-flow-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin: 64px 0;
          flex-wrap: wrap;
        }
        .demo-node {
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 16px 20px;
          text-align: center;
          min-width: 120px;
        }
        .demo-node.active { border-color: var(--green); background: var(--green-dim); }
        .demo-node-icon { font-size: 20px; margin-bottom: 6px; }
        .demo-node-label { font-family: var(--mono); font-size: 10px; color: var(--muted); }
        .demo-node.active .demo-node-label { color: var(--green); }
        .demo-arrow {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--green);
          padding: 0 8px;
        }
        .demo-highlight {
          background: var(--bg);
          border: 1px solid var(--border2);
          padding: 32px;
          text-align: left;
          margin-top: 48px;
        }
        .demo-highlight-label {
          font-family: var(--mono);
          font-size: 10px;
          color: var(--green);
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }
        .demo-highlight-text {
          font-family: var(--mono);
          font-size: 13px;
          color: var(--white);
          line-height: 1.8;
        }
        .demo-highlight-text .hl { color: var(--green); }

        /* Call To Action badges */
        .cta-section {
          padding: 120px 60px;
          position: relative; z-index: 1;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        .cta-section h2 {
          font-size: clamp(40px, 5vw, 72px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }
        .cta-section p {
          font-family: var(--mono);
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 48px;
        }
        .network-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--muted);
          padding: 8px 16px;
          border: 1px solid var(--border);
          margin-top: 32px;
        }
        .network-badge span { color: var(--green); }

        /* Footer Section */
        footer {
          border-top: 1px solid var(--border);
          padding: 40px 60px;
          display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 1;
          flex-wrap: wrap; gap: 16px;
        }
        .footer-left { font-family: var(--mono); font-size: 12px; color: var(--muted); }
        .footer-left a { color: var(--green); text-decoration: none; }
        .footer-right { display: flex; gap: 32px; }
        .footer-right a { font-family: var(--mono); font-size: 11px; color: var(--muted); text-decoration: none; }
        .footer-right a:hover { color: var(--white); }

        /* Reveal animations on scroll loop */
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* MOBILE RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
          nav {
            padding: 20px 40px;
          }
          .hero {
            padding: 100px 40px 60px;
          }
          .flow-section, .arch-section, .primitives-section, footer {
            padding: 80px 40px;
          }
          .primitives-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .flow-steps {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          nav {
            padding: 16px 20px;
          }
          .nav-links {
            display: none; /* Hide links on mobile to save space */
          }
          .hero {
            padding: 120px 20px 40px;
            text-align: center;
          }
          .hero-sub {
            margin: 0 auto 32px;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-stat-row {
            justify-content: center;
            gap: 24px;
          }
          .flow-section, .arch-section, .primitives-section, footer {
            padding: 60px 20px;
          }
          .flow-steps {
            grid-template-columns: 1fr;
          }
          .arch-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .primitives-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          footer {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
        }

        @media (max-width: 480px) {
          .primitives-grid {
            grid-template-columns: 1fr;
          }
          .hero-stat-row {
            flex-direction: column;
            align-items: center;
          }
        }
      ` }} />

      <div className="grid-bg"></div>
      <div className="noise"></div>

      <nav>
        <a href="#" className="nav-logo">
          <span className="pay">PAY</span>
          <span className="slash">/</span>
          <span className="per">PER</span>
          <span className="slash">/</span>
          <span className="prompt">PROMPT</span>
        </a>
        <ul className="nav-links">
          <li><a href="#how">How it works</a></li>
          <li><a href="#architecture">Architecture</a></li>
          <li><a href="#primitives">Kite stack</a></li>
        </ul>
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, mounted }) => {
            const connected = mounted && account && chain;
            return (
              <button
                onClick={connected ? () => router.push('/dashboard') : openConnectModal}
                className="nav-cta"
                type="button"
                style={{ cursor: 'pointer' }}
              >
                {connected ? 'OPEN DASHBOARD →' : 'CONNECT WALLET →'}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Built on Kite AI Testnet · Chain ID 2368</div>
          <h1 className="hero-headline">
            <span className="line1">Stripe for</span>
            <span className="line2">AI Agents.</span>
            <span className="line3">Pay per call.</span>
          </h1>
          <p className="hero-sub">
            The first API marketplace where <em>autonomous agents discover, call, and pay</em> for APIs per-use in USDC. Every micropayment settled on Kite. Every call attested on-chain.
          </p>
          <div className="hero-actions">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                return (
                  <button
                    onClick={connected ? () => router.push('/dashboard') : openConnectModal}
                    className="btn-primary"
                    type="button"
                    style={{ cursor: 'pointer' }}
                  >
                    {connected ? 'OPEN DASHBOARD →' : 'CONNECT WALLET TO START →'}
                  </button>
                );
              }}
            </ConnectButton.Custom>
            <a href="#how" className="btn-secondary">SEE HOW IT WORKS</a>
          </div>
          <div className="hero-stat-row">
            <div className="hero-stat"><div className="num">$0.001</div><div className="label">MINIMUM PRICE PER CALL</div></div>
            <div className="hero-stat"><div className="num">∞</div><div className="label">API PROVIDERS SUPPORTED</div></div>
            <div className="hero-stat"><div className="num">100%</div><div className="label">ON-CHAIN AUDIT TRAIL</div></div>
            <div className="hero-stat"><div className="num">0 GAS</div><div className="label">FOR AGENT PAYMENTS</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="terminal" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minHeight: '340px' }}>
            <div className="terminal-bar">
              <div className="terminal-dot" style={{ background: '#ff5f56' }}></div>
              <div className="terminal-dot" style={{ background: '#ffbd2e' }}></div>
              <div className="terminal-dot" style={{ background: '#27c93f' }}></div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>agent.ts</span>
            </div>
            <div className="terminal-body" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {terminalLines.map((line, idx) => {
                let colorClass = "t-white";
                if (line.startsWith(">")) colorClass = "t-keyword";
                else if (line.startsWith("🔍")) colorClass = "t-blue";
                else if (line.startsWith("✓") || line.startsWith("🎉")) colorClass = "t-green";
                else if (line.startsWith("🛂") || line.startsWith("📡") || line.startsWith("⚡") || line.startsWith("⛽") || line.startsWith("🔗")) colorClass = "t-yellow";

                const isLast = idx === terminalLines.length - 1;
                return (
                  <div key={idx} className={isLast ? "typing" : ""} style={{ minHeight: '20px' }}>
                    <span className={colorClass}>{line}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="flow-section" id="how">
        <div className="section-label">How it works</div>
        <h2 className="section-title">From discovery<br/>to settlement in seconds</h2>
        <div className="flow-steps">
          <div className="flow-step reveal" data-num="01 — REGISTER">
            <div className="flow-step-icon">📋</div>
            <h3>Register API</h3>
            <p>Providers deploy their service to the Kite registry contract — name, endpoint, USDC price/call, capability tags.</p>
            <span className="kite-tag">KITE CHAIN · SOLIDITY</span>
          </div>
          <div className="flow-step reveal" data-num="02 — DISCOVER">
            <div className="flow-step-icon">🔍</div>
            <h3>Agent Discovers</h3>
            <p>Your AI agent queries the Goldsky subgraph in real-time. "Find me a weather API under $0.01/call." Instant ranked results.</p>
            <span className="kite-tag">GOLDSKY SUBGRAPH</span>
          </div>
          <div className="flow-step reveal" data-num="03 — SESSION">
            <div className="flow-step-icon">🔐</div>
            <h3>Create Session</h3>
            <p>Agent creates a Kite Passport spending session — budget cap, time limit, scoped to this API. You approve once with passkey.</p>
            <span className="kite-tag">AGENT PASSPORT</span>
          </div>
          <div className="flow-step reveal" data-num="04 — CALL + PAY">
            <div className="flow-step-icon">⚡</div>
            <h3>Atomic Pay-and-Call</h3>
            <p>USDC micropayment sent gaslessly via EIP-3009 before response releases. No pay = no data. Enforced on-chain.</p>
            <span className="kite-tag">EIP-3009 GASLESS</span>
          </div>
          <div className="flow-step reveal" data-num="05 — ATTEST">
            <div className="flow-step-icon">🔗</div>
            <h3>On-Chain Attestation</h3>
            <p>Every call logged immutably: provider, endpoint, amount, timestamp, tx hash. Permanent audit receipt on Kite.</p>
            <span className="kite-tag">KITE ATTESTATION</span>
          </div>
          <div className="flow-step reveal" data-num="06 — DASHBOARD">
            <div className="flow-step-icon">📊</div>
            <h3>Live Analytics</h3>
            <p>Real-time Goldsky feed shows all agent API spend. Founders finally see exactly where every AI dollar goes.</p>
            <span className="kite-tag">GOLDSKY LIVE FEED</span>
          </div>
        </div>
      </section>

      <section className="arch-section" id="architecture">
        <div className="arch-inner">
          <div className="section-label">Architecture</div>
          <h2 className="section-title">Built directly from<br/>Kite docs</h2>
          <div className="arch-grid">
            <div className="code-block reveal" style={{ minHeight: '440px', background: '#090d16', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="code-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="code-filename" style={{ color: '#94a3b8' }}>{ARCH_METADATA[activeArchIdx].filename}</span>
                <span className="code-lang">{ARCH_METADATA[activeArchIdx].lang}</span>
              </div>
              <div className="code-body" style={{ whiteSpace: 'pre-wrap', minHeight: '380px', color: '#cbd5e1', fontSize: '11.5px', fontFamily: 'var(--mono)', padding: '20px', lineHeight: '1.6' }}>
                {ARCH_CODES[activeArchIdx]}
              </div>
            </div>
            <div className="arch-features reveal">
              <div 
                className={`arch-feature ${activeArchIdx === 0 ? 'active' : ''}`}
                onClick={() => { setActiveArchIdx(0); setIsPaused(true); }}
                onMouseEnter={() => { setActiveArchIdx(0); setIsPaused(true); }}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="arch-feature-progress"></div>
                <div className="af-icon">🌐</div>
                <div>
                  <div className="af-title">Kite Testnet — Chain ID 2368</div>
                  <div className="af-desc">RPC: rpc-testnet.gokite.ai · Explorer: testnet.kitescan.ai · Faucet: faucet.gokite.ai</div>
                </div>
              </div>
              <div 
                className={`arch-feature ${activeArchIdx === 1 ? 'active' : ''}`}
                onClick={() => { setActiveArchIdx(1); setIsPaused(true); }}
                onMouseEnter={() => { setActiveArchIdx(1); setIsPaused(true); }}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="arch-feature-progress"></div>
                <div className="af-icon">🤖</div>
                <div>
                  <div className="af-title">Agent Passport — Spending Sessions</div>
                  <div className="af-desc">Install via curl agentpassport.ai/install.sh · Budget + time limit per session · Passkey approval</div>
                </div>
              </div>
              <div 
                className={`arch-feature ${activeArchIdx === 2 ? 'active' : ''}`}
                onClick={() => { setActiveArchIdx(2); setIsPaused(true); }}
                onMouseEnter={() => { setActiveArchIdx(2); setIsPaused(true); }}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="arch-feature-progress"></div>
                <div className="af-icon">⛽</div>
                <div>
                  <div className="af-title">EIP-3009 Gasless — PYUSD Testnet</div>
                  <div className="af-desc">Token: 0x8E04D099...242ec9 · validBefore window: 30s · POST to gasless.gokite.ai/testnet</div>
                </div>
              </div>
              <div 
                className={`arch-feature ${activeArchIdx === 3 ? 'active' : ''}`}
                onClick={() => { setActiveArchIdx(3); setIsPaused(true); }}
                onMouseEnter={() => { setActiveArchIdx(3); setIsPaused(true); }}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="arch-feature-progress"></div>
                <div className="af-icon">🏦</div>
                <div>
                  <div className="af-title">AA SDK — ClientAgentVault</div>
                  <div className="af-desc">Settlement token: 0x0fF5393...e27e63 · Vault impl: 0xB5AAFCC6...e23 · npm: gokite-aa-sdk</div>
                </div>
              </div>
              <div 
                className={`arch-feature ${activeArchIdx === 4 ? 'active' : ''}`}
                onClick={() => { setActiveArchIdx(4); setIsPaused(true); }}
                onMouseEnter={() => { setActiveArchIdx(4); setIsPaused(true); }}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="arch-feature-progress"></div>
                <div className="af-icon">📊</div>
                <div>
                  <div className="af-title">Goldsky — Real-Time Indexing</div>
                  <div className="af-desc">Chain slug: kite-ai-testnet · GraphQL subgraph for service registry + call history · Live analytics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="primitives-section" id="primitives">
        <div className="section-label">Kite stack</div>
        <h2 className="section-title">Every Kite primitive,<br/>fully integrated</h2>
        <div className="primitives-grid">
          <div className="primitive-card reveal">
            <div className="primitive-icon">🛂</div>
            <div className="primitive-name">Agent Passport</div>
            <div className="primitive-desc">Identity + spending sessions. Providers verify agent, scope budget per call.</div>
          </div>
          <div className="primitive-card reveal">
            <div className="primitive-icon">⚡</div>
            <div className="primitive-name">AA SDK</div>
            <div className="primitive-desc">ClientAgentVault with per-provider budget rules. Agents can't overspend.</div>
          </div>
          <div className="primitive-card reveal">
            <div className="primitive-icon">⛽</div>
            <div className="primitive-name">Gasless USDC</div>
            <div className="primitive-desc">EIP-3009 signed auth. Users never touch gas. PYUSD on testnet.</div>
          </div>
          <div className="primitive-card reveal">
            <div className="primitive-icon">🔗</div>
            <div className="primitive-name">Attestations</div>
            <div className="primitive-desc">Every API call attested on Kite chain. Immutable billing proof.</div>
          </div>
          <div className="primitive-card reveal">
            <div className="primitive-icon">📊</div>
            <div className="primitive-name">Goldsky</div>
            <div className="primitive-desc">Subgraph indexes registry + calls. Powers live discovery UI.</div>
          </div>
        </div>
      </section>



      <section className="cta-section">
        <div className="section-label">Get started</div>
        <h2 className="reveal">Start building.<br/><span style={{ color: 'var(--green)' }}>Ship tomorrow.</span></h2>
        <p className="reveal">Clone the repo, add your Claude API key, deploy to Vercel. The entire Kite integration is wired up — testnet ready out of the box.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <button
                  onClick={connected ? () => router.push('/dashboard') : openConnectModal}
                  className="btn-primary"
                  type="button"
                  style={{ cursor: 'pointer' }}
                >
                  {connected ? 'OPEN DASHBOARD →' : 'CONNECT WALLET TO START →'}
                </button>
              );
            }}
          </ConnectButton.Custom>
          <a href="#" className="btn-secondary">VIEW ON GITHUB</a>
        </div>
        <div className="network-badge">
          <span>●</span> LIVE ON KITE TESTNET · CHAIN ID <span>2368</span> · RPC: rpc-testnet.gokite.ai
        </div>
      </section>

      <footer>
        <div className="footer-left">
          PayPerPrompt — Built for <a href="https://gokite.ai" target="_blank" style={{ color: 'var(--green)', textDecoration: 'none' }}>Kite AI</a> Global Hackathon 2026
        </div>
        <div className="footer-right">
          <a href="#how">Docs</a>
          <a href="/dashboard">Dashboard</a>
          <a href="https://testnet.kitescan.ai" target="_blank">KiteScan</a>
          <a href="https://faucet.gokite.ai" target="_blank">Faucet</a>
        </div>
      </footer>
    </>
  );
}
