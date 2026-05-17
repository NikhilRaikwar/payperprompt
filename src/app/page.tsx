'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Page() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [activeNodeIdx, setActiveNodeIdx] = useState(0);

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
          font-family: var(--mono);
          font-size: 14px;
          color: var(--green);
          letter-spacing: 0.05em;
          text-decoration: none;
        }
        .nav-logo span { color: var(--muted); }
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
          transition: border-color 0.2s;
        }
        .arch-feature:hover { border-color: var(--border2); }
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
        <a href="#" className="nav-logo">PAY<span>/</span>PER<span>/</span>PROMPT</a>
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
          <div className="terminal">
            <div className="terminal-bar">
              <div className="terminal-dot" style={{ background: '#ff5f56' }}></div>
              <div className="terminal-dot" style={{ background: '#ffbd2e' }}></div>
              <div className="terminal-dot" style={{ background: '#27c93f' }}></div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>agent.ts</span>
            </div>
            <div className="terminal-body">
              <div><span className="t-muted">// Agent discovers & pays for weather API</span></div>
              <div><span className="t-keyword">const</span> <span className="t-var">api</span> = <span className="t-keyword">await</span> <span className="t-fn">discoverAPI</span>({`{`}</div>
              <div>&nbsp;&nbsp;<span className="t-white">query:</span> <span className="t-string">'weather'</span>,</div>
              <div>&nbsp;&nbsp;<span className="t-white">maxPrice:</span> <span className="t-string">'0.01 USDC'</span></div>
              <div>{`}`});</div>
              <div>&nbsp;</div>
              <div><span className="t-muted">// Session approved ✓ Budget: $1 USDC</span></div>
              <div><span className="t-keyword">const</span> <span className="t-var">result</span> = <span className="t-keyword">await</span> <span className="t-fn">callAndPay</span>({`{`}</div>
              <div>&nbsp;&nbsp;<span className="t-white">endpoint:</span> <span className="t-var">api</span>.url,</div>
              <div>&nbsp;&nbsp;<span className="t-white">amount:</span> <span className="t-var">api</span>.price,</div>
              <div>&nbsp;&nbsp;<span className="t-white">token:</span> <span className="t-string">'PYUSD'</span></div>
              <div>{`}`});</div>
              <div>&nbsp;</div>
              <div><span className="t-green">✓ Paid 0.005 USDC gaslessly</span></div>
              <div><span className="t-green">✓ Attested on Kite: 0x3f2a...</span></div>
              <div className="t-green typing">✓ Result delivered</div>
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
            <div className="code-block reveal">
              <div className="code-header">
                <span className="code-filename">kite-integration.ts</span>
                <span className="code-lang">TypeScript</span>
              </div>
              <div className="code-body" style={{ whiteSpace: 'pre' }}>
                <span className="c-comment">// AA SDK — from Kite docs</span><br/>
                <span className="c-keyword">import</span> {`{ GokiteAASDK }`} <span className="c-keyword">from</span> <span className="c-string">'gokite-aa-sdk'</span>;<br/><br/>
                <span className="c-keyword">const</span> <span className="c-var">sdk</span> = <span className="c-keyword">new</span> <span className="c-fn">GokiteAASDK</span>(<br/>
                &nbsp;&nbsp;<span className="c-string">'kite_testnet'</span>,<br/>
                &nbsp;&nbsp;<span className="c-string">'https://rpc-testnet.gokite.ai'</span>,<br/>
                &nbsp;&nbsp;<span className="c-string">'https://bundler-service.staging.gokite.ai/rpc/'</span><br/>
                );<br/><br/>
                <span className="c-comment">// Gasless USDC payment — EIP-3009</span><br/>
                <span className="c-keyword">const</span> <span className="c-var">payment</span> = <span className="c-keyword">await</span> <span className="c-fn">fetch</span>(<br/>
                &nbsp;&nbsp;<span className="c-string">'https://gasless.gokite.ai/testnet'</span>,<br/>
                &nbsp;&nbsp;{`{`}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;method: <span className="c-string">'POST'</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;body: <span className="c-fn">JSON.stringify</span>({`{`}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;from: agentWallet,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to: providerAddress,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;value: callPrice,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;tokenAddress: <span className="c-comment">// PYUSD testnet</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="c-string">'0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9'</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;validBefore: Date.now() + <span className="c-num">30000</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...eip3009Sig<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{`}`})<br/>
                &nbsp;&nbsp;{`}`}<br/>
                );<br/><br/>
                <span className="c-comment">// Spending rules — AA SDK</span><br/>
                <span className="c-keyword">const</span> <span className="c-var">rules</span> = [{`{`}<br/>
                &nbsp;&nbsp;timeWindow: <span className="c-num">86400n</span>, <span className="c-comment">// 24h</span><br/>
                &nbsp;&nbsp;budget: parseUnits(<span className="c-string">'1'</span>, <span className="c-num">18</span>), <span className="c-comment">// $1</span><br/>
                &nbsp;&nbsp;targetProviders: [providerAddr]<br/>
                {`}`}[];
              </div>
            </div>
            <div className="arch-features reveal">
              <div className="arch-feature">
                <div className="af-icon">🌐</div>
                <div>
                  <div className="af-title">Kite Testnet — Chain ID 2368</div>
                  <div className="af-desc">RPC: rpc-testnet.gokite.ai · Explorer: testnet.kitescan.ai · Faucet: faucet.gokite.ai</div>
                </div>
              </div>
              <div className="arch-feature">
                <div className="af-icon">🤖</div>
                <div>
                  <div className="af-title">Agent Passport — Spending Sessions</div>
                  <div className="af-desc">Install via curl agentpassport.ai/install.sh · Budget + time limit per session · Passkey approval</div>
                </div>
              </div>
              <div className="arch-feature">
                <div className="af-icon">⛽</div>
                <div>
                  <div className="af-title">EIP-3009 Gasless — PYUSD Testnet</div>
                  <div className="af-desc">Token: 0x8E04D099...242ec9 · validBefore window: 30s · POST to gasless.gokite.ai/testnet</div>
                </div>
              </div>
              <div className="arch-feature">
                <div className="af-icon">🏦</div>
                <div>
                  <div className="af-title">AA SDK — ClientAgentVault</div>
                  <div className="af-desc">Settlement token: 0x0fF5393...e27e63 · Vault impl: 0xB5AAFCC6...e23 · npm: gokite-aa-sdk</div>
                </div>
              </div>
              <div className="arch-feature">
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
