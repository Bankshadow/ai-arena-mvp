"use client";

import { FormEvent, useState, type CSSProperties, type ReactNode } from "react";

const NAV_LINKS = [
  { href: "#pain", label: "Why" },
  { href: "#analogy", label: "Philosophy" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#challenge", label: "Challenge" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "#audience", label: "Who it's for" },
  { href: "#faq", label: "FAQ" },
];

const PAIN_CARDS = [
  {
    title: "Token costs are rising",
    body: "Every extra call adds up. Teams burn budget on retries, long contexts, and overbuilt chains.",
  },
  {
    title: "Context limits slow teams down",
    body: "Large inputs force chunking hacks and quality tradeoffs. Efficiency becomes an afterthought.",
  },
  {
    title: "Prompt quality is inconsistent",
    body: "Same task, wildly different outputs. Without benchmarks, nobody knows what “good” costs.",
  },
  {
    title: "No one knows the most cost-efficient workflow",
    body: "There's no public scoreboard for quality per dollar. The best builders stay invisible.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Pick a challenge",
    desc: "Choose a real task with fixed inputs, budget caps, and scoring rules.",
  },
  {
    num: "02",
    title: "Build a prompt or workflow",
    desc: "Design your pipeline — models, tools, routing — to maximize results per token.",
  },
  {
    num: "03",
    title: "Submit your result",
    desc: "Run against the same dataset as everyone else. Your cost and output are logged.",
  },
  {
    num: "04",
    title: "AI Judge scores quality and cost",
    desc: "Automated evaluation on accuracy, completeness, and spend. No hype — just numbers.",
  },
  {
    num: "05",
    title: "Climb the leaderboard",
    desc: "Rank by composite score. Study top workflows. Iterate and reclaim #1.",
  },
];

const LEADERBOARD = [
  { rank: 1, player: "TokenHunter", quality: 94, cost: "$0.08", score: 96.4 },
  { rank: 2, player: "AIWizard", quality: 92, cost: "$0.12", score: 94.7 },
  { rank: 3, player: "PromptKing", quality: 89, cost: "$0.17", score: 91.8 },
  { rank: 4, player: "You", quality: "--", cost: "--", score: "Join Beta", isYou: true },
];

const AUDIENCE = [
  {
    title: "Prompt Engineers",
    body: "Prove your prompts win on quality and cost — not just vibes in a doc.",
  },
  {
    title: "AI Engineers",
    body: "Benchmark workflows, compare architectures, and ship leaner pipelines.",
  },
  {
    title: "Product Teams",
    body: "De-risk AI features with clear efficiency targets before you scale spend.",
  },
  {
    title: "Enterprises",
    body: "Identify top talent and standardize cost-aware AI practices across teams.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is AI ARENA a prompt competition?",
    a: "It's a workflow efficiency competition. You can compete with a single prompt or a multi-step pipeline — what matters is hitting the challenge goal while minimizing cost.",
  },
  {
    q: "How is the winner selected?",
    a: "Each challenge defines a scoring formula (e.g. 80% quality + 20% cost efficiency). Our AI Judge evaluates output quality and tracks your spend. Highest composite score wins.",
  },
  {
    q: "Do I need to connect my own AI account?",
    a: "For beta, you'll connect your provider API keys so runs are billed to you and costs are measured accurately. Sandbox options may be available for select challenges.",
  },
  {
    q: "When will the first challenge launch?",
    a: "Executive Summary Battle #1 opens with the beta. Join the waitlist — we'll email you as soon as spots are available.",
  },
];

const ROLES = [
  "AI Builder",
  "Prompt Engineer",
  "Developer",
  "Enterprise",
  "Curious",
] as const;

type Role = (typeof ROLES)[number];

const TOKEN_CHIPS = [
  { value: "1K", color: "from-zinc-600 to-zinc-800", ring: "border-zinc-500/40" },
  { value: "5K", color: "from-emerald-700 to-emerald-900", ring: "border-emerald-500/50" },
  { value: "10K", color: "from-amber-600 to-amber-900", ring: "border-amber-500/50" },
  { value: "25K", color: "from-violet-600 to-violet-900", ring: "border-violet-500/50" },
];

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl animate-pulse-glow ${className ?? ""}`}
      aria-hidden
    />
  );
}

function SectionLabel({ children, accent = "emerald" }: { children: ReactNode; accent?: "emerald" | "violet" | "cyan" }) {
  const colors = {
    emerald: "text-emerald-500/80",
    violet: "text-violet-400/90",
    cyan: "text-cyan-400/90",
  };
  return (
    <p className={`font-mono text-xs uppercase tracking-[0.2em] ${colors[accent]}`}>
      {children}
    </p>
  );
}

function TokenChip({
  value,
  color,
  ring,
  style,
}: {
  value: string;
  color: string;
  ring: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 bg-gradient-to-br shadow-lg ${color} ${ring}`}
      style={style}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">TOK</span>
      <span className="font-mono text-lg font-bold text-white">{value}</span>
    </div>
  );
}

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [waitlist, setWaitlist] = useState<{ name: string; email: string; role: Role }>({
    name: "",
    email: "",
    role: ROLES[0],
  });

  function handleWaitlist(e: FormEvent) {
    e.preventDefault();
    alert("Thanks for joining the AI ARENA beta waitlist.");
    setWaitlist({ name: "", email: "", role: ROLES[0] });
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

          <div className="hidden items-center gap-6 lg:flex">
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

          <div className="flex items-center gap-3">
            <a
              href="#waitlist"
              className="hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 sm:inline-block"
            >
              Join Beta Waitlist
            </a>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 lg:hidden"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-expanded={mobileNavOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">Menu</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {mobileNavOpen && (
          <div className="border-t border-white/[0.06] bg-[#030303]/95 px-6 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-300"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#waitlist"
                className="mt-2 rounded-full bg-white px-4 py-2.5 text-center text-sm font-medium text-black"
                onClick={() => setMobileNavOpen(false)}
              >
                Join Beta Waitlist
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* 1. Hero */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-1.5 text-xs text-emerald-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--accent-glow)]" />
            Beta challenge launching soon
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Compete to build the{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              most efficient
            </span>{" "}
            AI workflows
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Solve the same challenge. Use fewer tokens. Get better results. Climb the leaderboard.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#waitlist"
              className="rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Join Beta Waitlist
            </a>
            <a
              href="#challenge"
              className="rounded-full border border-white/15 px-8 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:bg-white/[0.04]"
            >
              View First Challenge
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

        {/* 2. Pain Points */}
        <section id="pain" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Why AI ARENA</SectionLabel>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              AI is powerful. But inefficient AI is expensive.
            </h2>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PAIN_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-emerald-500/25 hover:bg-white/[0.04]"
                >
                  <div className="mb-4 h-px w-10 bg-gradient-to-r from-emerald-500/60 to-transparent" />
                  <h3 className="text-base font-medium text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Poker Analogy */}
        <section id="analogy" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div>
              <SectionLabel accent="violet">Philosophy</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Token is the chip of AI.
              </h2>
              <div className="mt-6 space-y-4 text-zinc-400 leading-relaxed">
                <p>
                  In poker, the best player is not the one who spends the most chips. The best player
                  maximizes expected value.
                </p>
                <p>AI works the same way.</p>
                <p>
                  The best workflow is not the most expensive one. It is the one that delivers the
                  best result with the lowest cost.
                </p>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="animate-float relative w-full max-w-md">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-600/20 to-emerald-600/20 blur-2xl" />
                <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 p-10 backdrop-blur-sm">
                  <div className="flex flex-wrap items-end justify-center gap-4">
                    {TOKEN_CHIPS.map((chip, i) => (
                      <TokenChip
                        key={chip.value}
                        {...chip}
                        style={{
                          transform: `rotate(${(i - 1.5) * 12}deg) translateY(${i === 1 || i === 2 ? -8 : 0}px)`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="mt-10 text-center font-mono text-xs text-zinc-500">
                    SPEND FEWER TOKENS · WIN MORE VALUE
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 text-sm">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                      <span className="block text-xs text-zinc-500">High EV</span>
                      <span className="text-emerald-400">94 quality · $0.08</span>
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                      <span className="block text-xs text-zinc-500">Low EV</span>
                      <span className="text-red-400/90">72 quality · $0.42</span>
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
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Five steps to the top of the board
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left"
              >
                <span className="font-mono text-xl text-emerald-500/50">{step.num}</span>
                <h3 className="mt-3 text-base font-medium leading-snug">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Sample Challenge */}
        <section id="challenge" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <SectionLabel accent="cyan">First challenge</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Executive Summary Battle #1
            </h2>

            <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold">Executive Summary Battle #1</h3>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-medium text-amber-300">
                    Beta opening soon
                  </span>
                </div>
              </div>

              <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Input", value: "20-page PDF" },
                  { label: "Goal", value: "Executive summary, key risks, and recommendations" },
                  { label: "Cost limit", value: "$1.00" },
                  { label: "Attempts", value: "3" },
                  { label: "Scoring", value: "80% Quality + 20% Cost Efficiency" },
                  { label: "Status", value: "Beta opening soon" },
                ].map((row) => (
                  <div key={row.label} className="bg-[#030303] px-6 py-5 sm:px-8">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{row.label}</p>
                    <p className="mt-1 text-sm text-zinc-200">{row.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
                <p className="text-sm text-zinc-500">
                  Same PDF for every competitor. Prove you can summarize better for less.
                </p>
                <a
                  href="#waitlist"
                  className="shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Join this challenge
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Leaderboard */}
        <section id="leaderboard" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Leaderboard preview</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Where efficiency becomes reputation
            </h2>

            <div className="mt-12 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Quality</th>
                    <th className="px-6 py-4">Cost</th>
                    <th className="px-6 py-4">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {LEADERBOARD.map((row) => (
                    <tr
                      key={row.rank}
                      className={`border-b border-white/[0.06] last:border-0 ${
                        row.isYou ? "bg-emerald-500/[0.06]" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm ${
                            row.rank === 1
                              ? "bg-amber-500/20 text-amber-300"
                              : row.rank === 2
                                ? "bg-zinc-400/20 text-zinc-300"
                                : row.rank === 3
                                  ? "bg-orange-700/20 text-orange-300"
                                  : "border border-dashed border-white/20 text-zinc-500"
                          }`}
                        >
                          #{row.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{row.player}</td>
                      <td className="px-6 py-4 font-mono text-zinc-300">{row.quality}</td>
                      <td className="px-6 py-4 font-mono text-zinc-400">{row.cost}</td>
                      <td className="px-6 py-4">
                        {row.isYou ? (
                          <a href="#waitlist" className="font-medium text-emerald-400 hover:text-emerald-300">
                            {row.score}
                          </a>
                        ) : (
                          <span className="font-mono font-medium text-white">{row.score}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 7. Audience */}
        <section id="audience" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Who it&apos;s for</SectionLabel>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for AI builders and cost-conscious teams
            </h2>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCE.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <h3 className="text-lg font-medium">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Waitlist */}
        <section id="waitlist" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-lg">
            <SectionLabel>Join the beta</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Get early access to the first challenge
            </h2>
            <p className="mt-4 text-zinc-400">
              Spots are limited for Executive Summary Battle #1. Tell us who you are — we&apos;ll
              notify you when beta opens.
            </p>

            <form onSubmit={handleWaitlist} className="mt-10 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={waitlist.name}
                  onChange={(e) => setWaitlist((w) => ({ ...w, name: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={waitlist.email}
                  onChange={(e) => setWaitlist((w) => ({ ...w, email: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label htmlFor="role" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Role
                </label>
                <select
                  id="role"
                  value={waitlist.role}
                  onChange={(e) =>
                    setWaitlist((w) => ({ ...w, role: e.target.value as Role }))
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role} className="bg-zinc-900">
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="h-12 w-full rounded-full bg-emerald-500 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Join Beta Waitlist
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-600">
              No spam. We&apos;ll only email you about beta access and challenge launches.
            </p>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-3xl">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Common questions
            </h2>
            <div className="mt-12 divide-y divide-white/[0.08] rounded-2xl border border-white/10 bg-white/[0.02]">
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium transition hover:bg-white/[0.02] sm:text-base"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                    >
                      {item.q}
                      <span
                        className={`shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-45" : ""}`}
                        aria-hidden
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <p className="px-6 pb-5 text-sm leading-relaxed text-zinc-400">{item.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 10. Final CTA */}
        <section className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-500/[0.08] to-transparent px-8 py-16 text-center sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to compete in the first AI efficiency challenge?
            </h2>
            <a
              href="#waitlist"
              className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Join Beta Waitlist
            </a>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-mono text-xs tracking-widest text-zinc-500">AI ARENA © 2026</span>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-zinc-500">
            <a href="#challenge" className="hover:text-zinc-300">
              Challenges
            </a>
            <a href="#waitlist" className="hover:text-zinc-300">
              Waitlist
            </a>
            <a href="#faq" className="hover:text-zinc-300">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
