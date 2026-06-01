"use client";

import { FormEvent, useState } from "react";

const NAV_LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#analogy", label: "Philosophy" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#challenge", label: "Challenge" },
  { href: "#leaderboard", label: "Leaderboard" },
];

const STEPS = [
  {
    num: "01",
    title: "Challenge",
    desc: "A real-world task drops. Same inputs, same constraints — everyone starts equal.",
    icon: "◈",
  },
  {
    num: "02",
    title: "Workflow",
    desc: "Design your pipeline: models, tools, routing, and cost controls. Ship your best architecture.",
    icon: "◇",
  },
  {
    num: "03",
    title: "Score",
    desc: "We benchmark latency, token spend, accuracy, and reliability. Efficiency wins.",
    icon: "◎",
  },
  {
    num: "04",
    title: "Leaderboard",
    desc: "Climb the ranks. Learn from top workflows. Iterate until you're #1.",
    icon: "◆",
  },
];

const LEADERBOARD = [
  { rank: 1, handle: "nova_ops", score: 98.4, cost: "$0.003", latency: "420ms", delta: "+2.1" },
  { rank: 2, handle: "graphmind", score: 97.1, cost: "$0.004", latency: "510ms", delta: "+0.8" },
  { rank: 3, handle: "latentlab", score: 96.8, cost: "$0.003", latency: "480ms", delta: "-0.2" },
  { rank: 4, handle: "you?", score: "—", cost: "—", latency: "—", delta: "join" },
];

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl animate-pulse-glow ${className ?? ""}`}
      aria-hidden
    />
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleWaitlist(e: FormEvent) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303] text-zinc-100">
      <div className="noise pointer-events-none fixed inset-0 z-0 opacity-60" aria-hidden />
      <div className="grid-bg pointer-events-none fixed inset-0 z-0" aria-hidden />

      <GlowOrb className="left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 bg-emerald-500/20" />
      <GlowOrb className="right-0 top-1/3 h-80 w-80 bg-violet-600/15" />
      <GlowOrb className="bottom-0 left-0 h-96 w-96 bg-cyan-500/10" />

      {/* Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#030303]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2 font-mono text-sm font-medium tracking-widest">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-400">
              AI
            </span>
            ARENA
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="#waitlist"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Join waitlist
          </a>
        </nav>
      </header>

      <main className="relative z-10">
        {/* 1. Hero */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--accent-glow)]" />
            Early access opening soon
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Compete to build the{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              most efficient
            </span>{" "}
            AI workflows
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            AI ARENA is where builders face off on real challenges — designing lean pipelines that
            win on speed, cost, and quality. Not who prompts best. Who engineers best.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#waitlist"
              className="group relative overflow-hidden rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              <span className="relative z-10">Get early access</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 transition group-hover:opacity-100" />
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/15 px-8 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:bg-white/[0.04]"
            >
              See how it works
            </a>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-zinc-500">
            {["Challenge", "Workflow", "Score", "Leaderboard"].map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="rounded border border-white/10 bg-white/[0.03] px-3 py-1.5 text-zinc-300">
                  {step}
                </span>
                {i < 3 && <span className="text-zinc-600">→</span>}
              </span>
            ))}
          </div>
        </section>

        {/* 2. Problem */}
        <section id="problem" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-500/80">
              The problem
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Everyone&apos;s building AI. Almost no one&apos;s measuring efficiency.
            </h2>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Bloated pipelines",
                  body: "Teams stack models and agents without benchmarks. Costs balloon. Latency hides in the shadows.",
                },
                {
                  title: "No shared standard",
                  body: "Blog posts claim wins. There's no arena to prove whose workflow actually performs under pressure.",
                },
                {
                  title: "Talent is invisible",
                  body: "The best systems engineers can't show skill the way competitive devs do — until now.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 transition hover:border-emerald-500/30 hover:bg-white/[0.04]"
                >
                  <div className="mb-4 h-px w-12 bg-gradient-to-r from-emerald-500/60 to-transparent" />
                  <h3 className="text-lg font-medium text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Poker Analogy */}
        <section id="analogy" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400/90">
                The poker analogy
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Same cards. Different players. Skill decides the pot.
              </h2>
              <p className="mt-6 text-zinc-400 leading-relaxed">
                In poker, everyone gets the same hand sometimes — what separates winners is how they
                play: position, reads, discipline, risk. AI ARENA works the same way.
              </p>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Every competitor receives the same challenge: identical data, APIs, and limits. Your
                edge isn&apos;t a bigger model budget. It&apos;s architecture — routing, caching,
                fallbacks, and ruthless optimization.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-zinc-300">
                {[
                  "Fixed constraints = fair table",
                  "Workflow design = your strategy",
                  "Public scores = the showdown",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="text-emerald-400">♠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative flex justify-center">
              <div className="animate-float relative w-full max-w-md">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-600/20 to-emerald-600/20 blur-2xl" />
                <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-sm">
                  <div className="flex justify-center gap-3">
                    {["A♠", "K♦", "Q♣"].map((card, i) => (
                      <div
                        key={card}
                        className="flex h-24 w-16 flex-col items-center justify-center rounded-lg border border-white/20 bg-gradient-to-b from-zinc-800 to-zinc-900 font-mono text-xl shadow-lg"
                        style={{ transform: `rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? -12 : 0}px)` }}
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                  <p className="mt-8 text-center font-mono text-xs text-zinc-500">
                    SAME CHALLENGE · DIFFERENT WORKFLOWS
                  </p>
                  <div className="mt-6 space-y-2 border-t border-white/10 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Player A</span>
                      <span className="text-emerald-400">+$2.4k efficiency</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Player B</span>
                      <span className="text-red-400/80">−$890 waste</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How It Works */}
        <section id="how-it-works" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-500/80">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Four moves. One arena.
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-left"
              >
                {i < STEPS.length - 1 && (
                  <span
                    className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-zinc-600 lg:block"
                    aria-hidden
                  >
                    →
                  </span>
                )}
                <span className="font-mono text-2xl text-emerald-500/40">{step.num}</span>
                <span className="mt-4 block text-2xl text-zinc-600">{step.icon}</span>
                <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Sample Challenge */}
        <section id="challenge" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/90">
                  Sample challenge
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Classify 10k support tickets under $5
                </h2>
                <p className="mt-4 text-zinc-400 leading-relaxed">
                  Route each ticket to the right queue with ≥95% accuracy. Hard cap on total API
                  spend. P95 latency under 600ms. Submissions run against a hidden holdout set.
                </p>
              </div>

              <div className="w-full max-w-lg shrink-0 rounded-2xl border border-white/10 bg-zinc-950/80 font-mono text-sm shadow-2xl shadow-emerald-500/5">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs text-zinc-500">challenge_014.json</span>
                </div>
                <pre className="overflow-x-auto p-6 text-xs leading-relaxed text-zinc-300">
{`{
  "id": "support-routing-v2",
  "constraints": {
    "max_budget_usd": 5.00,
    "min_accuracy": 0.95,
    "p95_latency_ms": 600
  },
  "inputs": "10,000 labeled tickets",
  "scoring": [
    "accuracy",
    "total_cost",
    "p95_latency",
    "reliability"
  ]
}`}
                </pre>
                <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-500">
                  847 builders submitted · closes in 6d
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Leaderboard Preview */}
        <section id="leaderboard" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-500/80">
              Leaderboard preview
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Where efficiency becomes reputation
            </h2>

            <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="grid grid-cols-[auto_1fr_repeat(3,auto)] gap-4 border-b border-white/10 px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <span>#</span>
                <span>Builder</span>
                <span className="hidden sm:block">Score</span>
                <span className="hidden md:block">Cost</span>
                <span className="hidden lg:block">Latency</span>
              </div>
              {LEADERBOARD.map((row) => (
                <div
                  key={row.rank}
                  className={`grid grid-cols-[auto_1fr_repeat(3,auto)] items-center gap-4 border-b border-white/[0.06] px-6 py-4 last:border-0 ${
                    row.handle === "you?"
                      ? "bg-emerald-500/[0.06]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm ${
                      row.rank === 1
                        ? "bg-amber-500/20 text-amber-300"
                        : row.rank === 2
                          ? "bg-zinc-400/20 text-zinc-300"
                          : row.rank === 3
                            ? "bg-orange-700/20 text-orange-300"
                            : "border border-dashed border-white/20 text-zinc-500"
                    }`}
                  >
                    {row.rank}
                  </span>
                  <div>
                    <span className="font-medium">{row.handle}</span>
                    {row.delta !== "join" && (
                      <span
                        className={`ml-2 text-xs ${
                          row.delta.startsWith("+") ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        {row.delta}
                      </span>
                    )}
                  </div>
                  <span className="hidden font-mono text-sm text-zinc-300 sm:block">{row.score}</span>
                  <span className="hidden font-mono text-sm text-zinc-400 md:block">{row.cost}</span>
                  <span className="hidden font-mono text-sm text-zinc-400 lg:block">{row.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Join Waitlist */}
        <section id="waitlist" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-500/80">
              Join the waitlist
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Claim your seat at the table
            </h2>
            <p className="mt-4 text-zinc-400">
              Be first to compete when AI ARENA opens. Founding members get early challenges and
              profile badges.
            </p>

            {submitted ? (
              <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8">
                <p className="text-lg font-medium text-emerald-300">You&apos;re on the list.</p>
                <p className="mt-2 text-sm text-zinc-400">
                  We&apos;ll reach out at <span className="text-white">{email}</span> when spots open.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 sm:max-w-xs"
                />
                <button
                  type="submit"
                  className="h-12 shrink-0 rounded-full bg-white px-8 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Join waitlist
                </button>
              </form>
            )}

            <p className="mt-6 text-xs text-zinc-600">
              No spam. Unsubscribe anytime. By joining you agree to challenge the status quo.
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-mono text-xs tracking-widest text-zinc-500">AI ARENA © 2026</span>
          <div className="flex gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-zinc-300">
              Twitter
            </a>
            <a href="#" className="hover:text-zinc-300">
              Discord
            </a>
            <a href="#" className="hover:text-zinc-300">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
