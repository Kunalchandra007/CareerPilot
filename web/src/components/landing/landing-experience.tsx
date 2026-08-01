"use client";

import { useEffect, useRef } from "react";
// Fonts are loaded globally by the root layout (next/font vars on <html>):
// --font-inter, --font-instrument-serif, --font-instrument-serif-italic. The CSS
// below references those variables directly.

// The public marketing landing page, ported verbatim from the hand-authored
// landing.html so the design stays pixel-identical. CSS + markup are injected as
// static strings (no user data, no app providers); the original vanilla JS
// (scrolled-nav, marquee, scroll-reveal, count-up, terminal typewriter, theme
// toggle) runs once in a guarded effect. Fonts map to the app's next/font vars.
// Download cards link to real launchers in /public. Two deltas from the .html:
// a smoother nav pill (inner element fades in, no width reflow) and a cleaner
// 3x2 features grid.

const CSS = String.raw`
.cp-landing{--serif:var(--font-instrument-serif),Georgia,serif;--sans:var(--font-inter),system-ui,sans-serif;--serif-i:var(--font-instrument-serif-italic),Georgia,serif;}
.cp-landing *{margin:0;padding:0;box-sizing:border-box}
.cp-landing{
  --l-bg:#f7f6f3;--l-surface:#faf9f6;--l-surface-2:#f2f1ed;
  --l-border:hsl(40 9% 86%);--l-border-strong:hsl(40 9% 78%);
  --l-fg:hsl(30 10% 11%);--l-muted:hsl(35 9% 34%);--l-faint:hsl(35 7% 52%);
  --l-brand:hsl(26 73% 51%);--l-brand-dark:hsl(26 80% 36%);
  --l-landing:#59592a;
  --l-glass-bg:hsl(45 30% 99% / .55);--l-glass-bg-strong:hsl(45 30% 99% / .72);
  --l-glass-border:hsl(40 20% 100% / .6);
  --l-glass-shadow:0 8px 32px hsl(35 40% 20% / .1),inset 0 1px 0 hsl(0 0% 100% / .5);
  --l-glass-blur:18px;
  background:var(--l-bg);color:var(--l-fg);font-family:var(--sans);-webkit-font-smoothing:antialiased;
  min-height:100vh;position:relative;overflow-x:clip;transition:background .4s ease,color .4s ease;
}
html.dark .cp-landing{
  --l-bg:#0a0a0a;--l-surface:#141312;--l-surface-2:#1c1a18;
  --l-border:hsl(30 6% 20%);--l-border-strong:hsl(30 6% 28%);
  --l-fg:hsl(40 10% 92%);--l-muted:hsl(38 6% 66%);--l-faint:hsl(38 5% 48%);
  --l-brand:hsl(26 82% 58%);--l-brand-dark:hsl(26 85% 66%);
  --l-landing:hsl(56 32% 62%);
  --l-glass-bg:hsl(30 10% 12% / .55);--l-glass-bg-strong:hsl(30 10% 14% / .74);
  --l-glass-border:hsl(40 20% 100% / .08);
  --l-glass-shadow:0 8px 32px hsl(0 0% 0% / .45),inset 0 1px 0 hsl(0 0% 100% / .06);
}
.cp-bg-orbs{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.cp-bg-orbs::before{content:'';position:absolute;width:900px;height:600px;top:-180px;right:-200px;background:radial-gradient(ellipse at center,hsl(26 73% 51% / .13) 0%,hsl(26 73% 51% / .05) 45%,transparent 70%);border-radius:50%;animation:cp-orb 18s ease-in-out infinite alternate}
.cp-bg-orbs::after{content:'';position:absolute;width:700px;height:500px;bottom:-100px;left:-150px;background:radial-gradient(ellipse at center,hsl(33 100% 60% / .09) 0%,hsl(26 73% 51% / .04) 50%,transparent 70%);border-radius:50%;animation:cp-orb 22s ease-in-out infinite alternate-reverse}
@keyframes cp-orb{0%{transform:translate(0,0) scale(1)}100%{transform:translate(40px,30px) scale(1.08)}}
.cp-wrap{position:relative;z-index:1}
/* NAV — smooth pill: outer bar keeps a fixed width, an inner element fades in
   the glass (bg/border/shadow) and rounds its corners on scroll. Nothing that
   changes layout width animates, so there is no reflow jank. */
.cp-nav{position:sticky;top:0;z-index:100;padding:0;transition:padding .4s cubic-bezier(.4,0,.2,1)}
.cp-nav.scrolled{padding:.6rem 1.1rem}
.cp-nav-inner{display:flex;align-items:center;justify-content:space-between;width:100%;padding:.95rem 1.9rem;border-radius:0;border:1px solid transparent;border-bottom-color:var(--l-glass-border);background:var(--l-glass-bg);box-shadow:none;-webkit-backdrop-filter:saturate(180%) blur(var(--l-glass-blur));backdrop-filter:saturate(180%) blur(var(--l-glass-blur));transition:padding .4s cubic-bezier(.4,0,.2,1),border-radius .4s cubic-bezier(.4,0,.2,1),background .4s ease,border-color .4s ease,box-shadow .4s ease}
.cp-nav.scrolled .cp-nav-inner{padding:.65rem 1.5rem;border-radius:999px;border-color:var(--l-glass-border);background:var(--l-glass-bg-strong);box-shadow:var(--l-glass-shadow)}
.cp-theme-btn{background:none;border:1px solid var(--l-border);color:var(--l-muted);width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;transition:border-color .15s,color .15s,background .15s}
.cp-theme-btn:hover{border-color:var(--l-brand);color:var(--l-brand);background:hsl(26 73% 51% / .07)}
.cp-logo{display:flex;align-items:center;gap:.55rem;text-decoration:none;color:var(--l-landing);font-family:var(--serif);font-size:1.2rem}
.cp-logo-mark{width:30px;height:30px;border-radius:7px;background:var(--l-brand);display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--sans);font-size:.75rem;font-weight:700;letter-spacing:-.02em}
.cp-nav-right{display:flex;align-items:center;gap:1.1rem}
.cp-nav-link{color:var(--l-muted);text-decoration:none;font-size:.875rem;font-weight:500;transition:color .15s}
.cp-nav-link:hover{color:var(--l-fg)}
.cp-nav-cta{background:var(--l-fg);color:var(--l-bg);border:none;padding:.45rem 1.1rem;border-radius:999px;font-size:.875rem;font-weight:600;cursor:pointer;text-decoration:none;transition:opacity .15s}
.cp-nav-cta:hover{opacity:.82}
/* HERO */
.cp-hero{max-width:960px;margin:0 auto;padding:6rem 2.5rem 5rem;position:relative}
.cp-hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:600px;height:1px;background:linear-gradient(90deg,transparent,hsl(26 73% 51% / .35),transparent)}
.cp-hero-kicker{display:inline-flex;align-items:center;gap:.5rem;font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--l-brand-dark);margin-bottom:2rem;padding:.3rem .8rem;border-radius:999px;border:1px solid hsl(26 73% 51% / .25);background:hsl(26 73% 51% / .06)}
.cp-hero-kicker::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--l-brand);animation:cp-pulse 2s infinite}
@keyframes cp-pulse{0%,100%{opacity:1}50%{opacity:.3}}
.cp-landing h1{font-family:var(--serif);font-size:clamp(3rem,6vw,5rem);line-height:1.04;letter-spacing:-.025em;color:var(--l-landing);margin-bottom:1.75rem;max-width:820px}
.cp-landing h1 em{font-style:italic;font-family:var(--serif-i);color:var(--l-brand)}
.cp-hero-sub{font-size:1.18rem;color:var(--l-muted);max-width:540px;line-height:1.7;margin-bottom:3rem;font-weight:400;letter-spacing:-.005em}
.cp-hero-sub b,.cp-hero-sub strong{color:var(--l-fg);font-weight:600}
.cp-hero-btns{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center}
.cp-btn-primary{background:var(--l-brand);color:#fff;border:none;padding:.85rem 1.9rem;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:.45rem;transition:filter .15s,box-shadow .15s;box-shadow:0 2px 16px hsl(26 73% 51% / .3)}
.cp-btn-primary:hover{filter:brightness(1.08);box-shadow:0 4px 24px hsl(26 73% 51% / .45)}
.cp-btn-ghost{background:transparent;color:var(--l-fg);border:1px solid var(--l-border-strong);padding:.85rem 1.9rem;border-radius:10px;font-size:.95rem;font-weight:500;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:.45rem;transition:border-color .15s,color .15s}
.cp-btn-ghost:hover{border-color:var(--l-brand);color:var(--l-brand-dark)}
/* PROOF */
.cp-proof{border-top:1px solid var(--l-glass-border);border-bottom:1px solid var(--l-glass-border);background:var(--l-glass-bg);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:2.5rem;display:flex;justify-content:center;gap:5rem;flex-wrap:wrap}
.cp-proof-item{text-align:center}
.cp-proof-n{font-family:var(--serif);font-size:2.6rem;color:var(--l-landing);line-height:1}
.cp-proof-l{font-size:.75rem;color:var(--l-faint);margin-top:.35rem;letter-spacing:.07em;text-transform:uppercase}
/* SECTION */
.cp-section{max-width:900px;margin:0 auto;padding:5.5rem 2.5rem}
.cp-section-label{font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--l-brand-dark);margin-bottom:.75rem}
.cp-landing h2{font-family:var(--serif);font-size:clamp(1.9rem,3.5vw,2.8rem);color:var(--l-landing);letter-spacing:-.025em;line-height:1.08;margin-bottom:.9rem}
.cp-section-sub{color:var(--l-muted);font-size:.975rem;line-height:1.75;max-width:480px;margin-bottom:3rem}
.cp-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.cp-step{background:var(--l-glass-bg);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--l-glass-border);border-radius:14px;padding:1.75rem;box-shadow:var(--l-glass-shadow);transition:border-color .2s,transform .2s,box-shadow .2s}
.cp-step:hover{border-color:hsl(26 73% 51% / .35);transform:translateY(-3px)}
.cp-step-num{font-family:var(--serif);font-size:1.6rem;color:var(--l-brand);line-height:1;margin-bottom:1rem}
.cp-step h3{font-size:.95rem;font-weight:600;color:var(--l-fg);margin-bottom:.4rem}
.cp-step p{font-size:.85rem;color:var(--l-muted);line-height:1.65}
/* TERMINAL */
.cp-term-wrap{margin-top:3rem;background:hsl(30 12% 9%);border-radius:16px;overflow:hidden;border:1px solid hsl(30 8% 18%);box-shadow:0 20px 60px rgba(0,0,0,.12),0 4px 16px rgba(0,0,0,.08)}
.cp-term-bar{background:hsl(30 10% 12%);padding:.7rem 1rem;display:flex;align-items:center;gap:.45rem;border-bottom:1px solid hsl(30 8% 16%)}
.cp-dot{width:11px;height:11px;border-radius:50%}
.cp-term-body{padding:1.5rem 1.6rem;font-family:'SF Mono','Fira Code',ui-monospace,monospace;font-size:.8rem;line-height:2;color:#b0a898;min-height:200px}
.cp-term-body .g{color:#7ec8a0}.cp-term-body .o{color:hsl(26 73% 65%)}.cp-term-body .b{color:#8ab4d4}.cp-term-body .dim{color:#5a5248}
.cp-cursor{display:inline-block;width:7px;height:1em;background:hsl(26 73% 65%);vertical-align:text-bottom;animation:cp-blink .9s step-end infinite}
@keyframes cp-blink{0%,100%{opacity:1}50%{opacity:0}}
/* DOWNLOAD */
.cp-dl-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.cp-dl-card{display:flex;flex-direction:column;background:var(--l-glass-bg);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--l-glass-border);border-radius:14px;padding:1.6rem;text-decoration:none;color:inherit;box-shadow:var(--l-glass-shadow);transition:border-color .2s,box-shadow .2s,transform .2s;cursor:pointer}
.cp-dl-card:hover{border-color:var(--l-brand);box-shadow:0 10px 32px hsl(26 73% 51% / .18);transform:translateY(-3px)}
.cp-dl-card.featured{border-color:hsl(26 73% 51% / .4);background:hsl(26 73% 51% / .07)}
.cp-dl-title{font-size:1rem;font-weight:600;margin-bottom:.3rem;color:var(--l-fg)}
.cp-dl-desc{font-size:.83rem;color:var(--l-muted);line-height:1.6;margin-bottom:1.1rem;flex:1}
.cp-dl-tag{align-self:flex-start;display:inline-flex;align-items:center;font-size:.73rem;font-weight:600;padding:.22rem .6rem;border-radius:999px;border:1px solid}
.cp-tag-win{color:hsl(220 80% 55%);border-color:hsl(220 80% 55% / .3);background:hsl(220 80% 55% / .08)}
.cp-tag-mac{color:hsl(270 60% 55%);border-color:hsl(270 60% 55% / .3);background:hsl(270 60% 55% / .08)}
.cp-tag-api{color:var(--l-brand-dark);border-color:hsl(26 73% 51% / .35);background:hsl(26 73% 51% / .08)}
.cp-tag-src{color:var(--l-muted);border-color:var(--l-border-strong);background:transparent}
.cp-divider{border:none;border-top:1px solid var(--l-border);margin:0}
.cp-footer{padding:2.25rem 2.5rem;text-align:center;color:var(--l-faint);font-size:.8rem;border-top:1px solid var(--l-border)}
.cp-footer a{color:var(--l-muted);text-decoration:none}
.cp-footer a:hover{color:var(--l-fg)}
/* SCROLL REVEAL */
.cp-reveal{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.cp-reveal.in{opacity:1;transform:none}
.cp-reveal[data-d="1"]{transition-delay:.09s}.cp-reveal[data-d="2"]{transition-delay:.18s}.cp-reveal[data-d="3"]{transition-delay:.27s}
@media(prefers-reduced-motion:reduce){.cp-reveal{opacity:1;transform:none;transition:none}}
/* MARQUEE */
.cp-marquee{position:relative;overflow:hidden;padding:2.25rem 0;border-bottom:1px solid var(--l-glass-border);-webkit-mask-image:linear-gradient(90deg,transparent,#000 11%,#000 89%,transparent);mask-image:linear-gradient(90deg,transparent,#000 11%,#000 89%,transparent)}
.cp-marquee-label{text-align:center;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--l-faint);margin-bottom:1.2rem}
.cp-marquee-track{display:flex;gap:.85rem;width:max-content;animation:cp-scroll-x 34s linear infinite}
.cp-marquee:hover .cp-marquee-track{animation-play-state:paused}
@keyframes cp-scroll-x{to{transform:translateX(-50%)}}
.cp-chip{display:inline-flex;align-items:center;gap:.45rem;white-space:nowrap;font-size:.82rem;font-weight:500;color:var(--l-muted);padding:.5rem 1.05rem;border-radius:999px;border:1px solid var(--l-glass-border);background:var(--l-glass-bg);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.cp-chip b{color:var(--l-brand-dark);font-weight:600}
/* FEATURES — improved 3x2 grid with a hover accent bar */
.cp-bento{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.cp-feat{position:relative;overflow:hidden;background:var(--l-glass-bg);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--l-glass-border);border-radius:16px;padding:1.8rem;box-shadow:var(--l-glass-shadow);transition:border-color .2s,transform .2s,box-shadow .2s}
.cp-feat::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--l-brand);transform:scaleY(0);transform-origin:top;transition:transform .25s ease}
.cp-feat:hover{border-color:hsl(26 73% 51% / .35);transform:translateY(-4px);box-shadow:0 14px 40px hsl(26 73% 51% / .12)}
.cp-feat:hover::before{transform:scaleY(1)}
.cp-feat-ico{display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:44px;padding:0 .5rem;border-radius:12px;font-family:var(--serif);font-size:1.35rem;font-weight:400;color:var(--l-brand);background:hsl(26 73% 51% / .1);border:1px solid hsl(26 73% 51% / .22);margin-bottom:1.1rem;letter-spacing:.02em}
.cp-feat h3{font-size:1rem;font-weight:600;color:var(--l-fg);margin-bottom:.45rem}
.cp-feat p{font-size:.86rem;color:var(--l-muted);line-height:1.68}
@media(max-width:820px){.cp-bento{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.cp-bento{grid-template-columns:1fr}.cp-proof{gap:2.5rem}}
`;

const DL_BAT = "/CareerPilot-Setup.bat";
const DL_SH = "/careerpilot-setup.sh";
const GH = "https://github.com/Kunalchandra007/CareerPilot";

const MARKUP = String.raw`
<div class="cp-bg-orbs"></div>
<div class="cp-wrap">
<nav class="cp-nav" id="cp-nav">
  <div class="cp-nav-inner">
    <a href="/" class="cp-logo"><div class="cp-logo-mark">CP</div>CareerPilot</a>
    <div class="cp-nav-right">
      <a href="#cp-how" class="cp-nav-link">How it works</a>
      <a href="${GH}" target="_blank" rel="noreferrer" class="cp-nav-link">GitHub</a>
      <button class="cp-theme-btn" id="cp-theme" type="button" aria-label="Toggle dark mode" title="Toggle theme">🌙</button>
      <a href="#cp-download" class="cp-nav-cta">Download free</a>
    </div>
  </div>
</nav>

<div class="cp-hero">
  <div class="cp-hero-kicker">Open source · Local-first · Zero cloud</div>
  <h1>Stop applying.<br>Start <em>landing</em>.</h1>
  <p class="cp-hero-sub">Finds the roles. Scores each one against your real CV. Drafts the application. <b>You just hit send</b> — and nothing ever leaves your machine.</p>
  <div class="cp-hero-btns">
    <a href="#cp-download" class="cp-btn-primary">↓ Download free</a>
    <a href="#cp-how" class="cp-btn-ghost">See how it works</a>
  </div>
</div>

<div class="cp-proof">
  <div class="cp-proof-item"><div class="cp-proof-n">45+</div><div class="cp-proof-l">Job boards scanned</div></div>
  <div class="cp-proof-item"><div class="cp-proof-n">100%</div><div class="cp-proof-l">Runs on your machine</div></div>
  <div class="cp-proof-item"><div class="cp-proof-n">0</div><div class="cp-proof-l">Data sent to cloud</div></div>
  <div class="cp-proof-item"><div class="cp-proof-n">Free</div><div class="cp-proof-l">Open source, always</div></div>
</div>

<div class="cp-marquee">
  <p class="cp-marquee-label">The pipeline, end to end</p>
  <div class="cp-marquee-track" id="cp-marquee">
    <span class="cp-chip">🔍 Scans <b>45+ boards</b></span>
    <span class="cp-chip">⚡ <b>0 tokens</b> to scan</span>
    <span class="cp-chip">🎯 Scores blocks <b>A–F</b></span>
    <span class="cp-chip">🛡️ Posting legitimacy check</span>
    <span class="cp-chip">📄 <b>ATS-ready</b> PDF per role</span>
    <span class="cp-chip">📊 Fit narrative from <b>your CV</b></span>
    <span class="cp-chip">🗂️ Tracks <b>Evaluated → Offer</b></span>
    <span class="cp-chip">🔒 <b>Runs local</b>, zero cloud</span>
    <span class="cp-chip">✅ You review before sending</span>
  </div>
</div>

<hr class="cp-divider">

<div class="cp-section cp-reveal" id="cp-how">
  <p class="cp-section-label">How it works</p>
  <h2>Scan. Score. Apply.</h2>
  <p class="cp-section-sub">Three loops that run on your machine. No SaaS, no subscription, no data leaving your computer.</p>
  <div class="cp-steps">
    <div class="cp-step">
      <div class="cp-step-num">01</div>
      <h3>Scan tracked companies</h3>
      <p>Hits 45+ Greenhouse, Lever, and Ashby boards directly. Zero LLM tokens. New roles land in your inbox sorted by freshness.</p>
    </div>
    <div class="cp-step">
      <div class="cp-step-num">02</div>
      <h3>Score against your CV</h3>
      <p>Runs the real evaluation — blocks A–F, posting legitimacy check, fit narrative — grounded in your actual CV and profile. Keywords reformulated, never fabricated.</p>
    </div>
    <div class="cp-step">
      <div class="cp-step-num">03</div>
      <h3>Apply with a tailored CV</h3>
      <p>Generates an ATS-optimized PDF for each application. Tracks status from Evaluated → Interview → Offer. You review before anything is sent.</p>
    </div>
  </div>
  <div class="cp-term-wrap">
    <div class="cp-term-bar">
      <div class="cp-dot" style="background:#ff5f57"></div>
      <div class="cp-dot" style="background:#febc2e"></div>
      <div class="cp-dot" style="background:#28c840"></div>
    </div>
    <div class="cp-term-body" id="cp-term"><span class="cp-cursor"></span></div>
  </div>
</div>

<hr class="cp-divider">

<div class="cp-section">
  <p class="cp-section-label cp-reveal">Why it's different</p>
  <h2 class="cp-reveal">Built to be trusted.</h2>
  <p class="cp-section-sub cp-reveal">Not another SaaS scraper. Every decision is grounded in your real CV, runs on your machine, and waits for your sign-off.</p>
  <div class="cp-bento">
    <div class="cp-feat cp-reveal">
      <div class="cp-feat-ico">01</div>
      <h3>Local-first, always</h3>
      <p>Your CV, matches, and reports stay on your disk. No account, no telemetry, no data leaving your computer.</p>
    </div>
    <div class="cp-feat cp-reveal" data-d="1">
      <div class="cp-feat-ico">02</div>
      <h3>Grounded, never fabricated</h3>
      <p>Scoring pulls from your actual CV. Keywords get reformulated to match a posting — never invented.</p>
    </div>
    <div class="cp-feat cp-reveal" data-d="2">
      <div class="cp-feat-ico">03</div>
      <h3>Zero-token scanning</h3>
      <p>Hits Greenhouse, Lever, and Ashby boards directly. No LLM cost to surface fresh roles.</p>
    </div>
    <div class="cp-feat cp-reveal">
      <div class="cp-feat-ico">04</div>
      <h3>Legitimacy checks</h3>
      <p>Flags ghost jobs and reposts before you waste effort, so you only apply to real openings.</p>
    </div>
    <div class="cp-feat cp-reveal" data-d="1">
      <div class="cp-feat-ico">05</div>
      <h3>A–F scored reports</h3>
      <p>Every role gets one honest number plus a full report — match, comp research, interview prep.</p>
    </div>
    <div class="cp-feat cp-reveal" data-d="2">
      <div class="cp-feat-ico">06</div>
      <h3>You stay in control</h3>
      <p>Drafts and prefills only. Nothing is submitted on your behalf — you review every application.</p>
    </div>
  </div>
</div>

<hr class="cp-divider">

<div class="cp-section cp-reveal" id="cp-download">
  <p class="cp-section-label">Get CareerPilot</p>
  <h2>One click to start.</h2>
  <p class="cp-section-sub">No account. No subscription. No data leaving your machine. Choose your platform.</p>
  <div class="cp-dl-grid">
    <a class="cp-dl-card featured" href="${DL_BAT}" download>
      <div class="cp-dl-title">Windows</div>
      <div class="cp-dl-desc">Double-click launcher. Checks Node + Git, clones the repo, builds, and opens the dashboard — no terminal needed.</div>
      <span class="cp-dl-tag cp-tag-win">↓ CareerPilot-Setup.bat</span>
    </a>
    <a class="cp-dl-card" href="${DL_SH}" download>
      <div class="cp-dl-title">macOS / Linux</div>
      <div class="cp-dl-desc">One script to install dependencies, build, and open the dashboard in your browser. Run <code>bash careerpilot-setup.sh</code>.</div>
      <span class="cp-dl-tag cp-tag-mac">↓ careerpilot-setup.sh</span>
    </a>
    <a class="cp-dl-card" href="${GH}#bring-your-own-api-key" target="_blank" rel="noreferrer">
      <div class="cp-dl-title">Bring your own API key</div>
      <div class="cp-dl-desc">No CLI to install. Paste your Anthropic API key in Config and start evaluating immediately.</div>
      <span class="cp-dl-tag cp-tag-api">API key mode</span>
    </a>
    <a class="cp-dl-card" href="${GH}" target="_blank" rel="noreferrer">
      <div class="cp-dl-title">From source</div>
      <div class="cp-dl-desc">Clone the repo, run npm ci in web/, then npm run dev. Full control, full customization.</div>
      <span class="cp-dl-tag cp-tag-src">Open source</span>
    </a>
  </div>
</div>

<footer class="cp-footer">
  <p>CareerPilot is open source · <a href="${GH}">GitHub</a></p>
  <p style="margin-top:.4rem">Your data stays on your machine. Always.</p>
</footer>
</div>
`;

export function LandingExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    // Scrolled nav pill
    const nav = root.querySelector<HTMLElement>("#cp-nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Marquee: duplicate chips once for a seamless loop
    const track = root.querySelector<HTMLElement>("#cp-marquee");
    if (track && track.dataset.doubled !== "1") {
      track.innerHTML += track.innerHTML;
      track.dataset.doubled = "1";
    }

    // Scroll reveal
    const revealObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    root.querySelectorAll(".cp-reveal").forEach((el) => revealObs.observe(el));

    // Count-up for proof numbers
    const countUp = (el: HTMLElement, target: number, suffix: string, duration: number) => {
      const start = performance.now();
      const frame = (now: number) => {
        if (cancelled) return;
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * ease) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    const proofObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        proofObs.unobserve(e.target);
        const el = e.target as HTMLElement;
        if (el.dataset.n === "Free") return;
        countUp(el, parseFloat(el.dataset.n || "0"), el.dataset.s || "", 1400);
      }),
      { threshold: 0.5 },
    );
    root.querySelectorAll<HTMLElement>(".cp-proof-n").forEach((el) => {
      const txt = (el.textContent || "").trim();
      if (txt === "Free") { el.dataset.n = "Free"; return; }
      const num = parseFloat(txt.replace(/[^0-9.]/g, ""));
      const suffix = txt.replace(/[0-9.]/g, "");
      el.dataset.n = String(num);
      el.dataset.s = suffix;
      el.textContent = "0" + suffix;
      proofObs.observe(el);
    });

    // Terminal typewriter
    const lines = [
      { html: '<span class="dim">$</span> <span class="b">node scan.mjs</span>', delay: 400 },
      { html: '<span class="g">✓</span> Scanned 45 companies · <span class="o">18 new offers found</span>', delay: 900 },
      { html: '<span class="dim">$</span> <span class="b">node reserve-report-num.mjs</span>', delay: 600 },
      { html: '<span class="dim">→</span> 042', delay: 500 },
      { html: '<span class="dim">$</span> <span class="b"># evaluating Anthropic · Research Engineer</span>', delay: 700 },
      { html: '<span class="g">✓</span> Report: <span class="o">reports/042-anthropic-2026-07-25.md</span>', delay: 2200 },
      { html: '<span class="g">✓</span> Tracker updated · PDF generated', delay: 600 },
      { html: '<span class="o">VERDICT: 4.7/5 — Strong fit, apply this week</span>', delay: 500 },
    ];
    const term = root.querySelector<HTMLElement>("#cp-term");
    let li = 0;
    const cursor = () => term?.querySelector(".cp-cursor");
    const typeLine = (html: string, done: () => void) => {
      if (!term || cancelled) return;
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      const len = (tmp.textContent || "").length;
      const span = document.createElement("span");
      term.insertBefore(span, cursor());
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i++;
        let vis = 0, out = "", inTag = false;
        for (let c = 0; c < html.length; c++) {
          if (html[c] === "<") inTag = true;
          if (!inTag) vis++;
          out += html[c];
          if (html[c] === ">") inTag = false;
          if (vis >= i) break;
        }
        span.innerHTML = out;
        if (i < len) timers.push(setTimeout(tick, 28 + Math.random() * 22));
        else { span.innerHTML = html; done(); }
      };
      tick();
    };
    const runNext = () => {
      if (cancelled || !term) return;
      if (li >= lines.length) {
        timers.push(setTimeout(() => {
          if (cancelled) return;
          term.innerHTML = '<span class="cp-cursor"></span>';
          li = 0;
          timers.push(setTimeout(runNext, 600));
        }, 4000));
        return;
      }
      const { html, delay } = lines[li++];
      timers.push(setTimeout(() => {
        if (cancelled || !term) return;
        if (li > 1) term.insertBefore(document.createElement("br"), cursor());
        typeLine(html, runNext);
      }, delay));
    };
    let termObs: IntersectionObserver | undefined;
    if (term) {
      termObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { termObs?.disconnect(); timers.push(setTimeout(runNext, 400)); }
      }, { threshold: 0.3 });
      termObs.observe(term);
    }

    // Theme toggle — same key the app reads, so the choice carries into the dashboard
    const themeBtn = root.querySelector<HTMLElement>("#cp-theme");
    const syncIcon = () => { if (themeBtn) themeBtn.textContent = document.documentElement.classList.contains("dark") ? "☀️" : "🌙"; };
    syncIcon();
    const onTheme = () => {
      const dark = document.documentElement.classList.toggle("dark");
      try { localStorage.setItem("career-ops:theme", dark ? "dark" : "light"); } catch { /* ignore */ }
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0a0a0a" : "#f7f6f3");
      window.dispatchEvent(new Event("themechange"));
      syncIcon();
    };
    themeBtn?.addEventListener("click", onTheme);

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      themeBtn?.removeEventListener("click", onTheme);
      revealObs.disconnect();
      proofObs.disconnect();
      termObs?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={rootRef} className="cp-landing" dangerouslySetInnerHTML={{ __html: MARKUP }} />
    </>
  );
}
