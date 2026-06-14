"use client";

import { FormEvent, useRef, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

import { joinWaitlist } from "@/app/actions/waitlist";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useTranslations } from "@/components/i18n/locale-provider";
import {
  INTEREST_API_VALUES,
  INTEREST_KEYS,
  translateChallengeDetailLabel,
  translateChallengeDetailValue,
  translateLandingStatus,
  type InterestKey,
} from "@/lib/i18n/helpers";

type InterestApiValue = (typeof INTEREST_API_VALUES)[InterestKey];
import type { LandingPageData } from "@/lib/landing/types";

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

function SectionLabel({
  children,
  accent = "emerald",
}: {
  children: ReactNode;
  accent?: "emerald" | "violet" | "cyan";
}) {
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

const defaultWaitlist = (roles: readonly string[]) => ({
  name: "",
  email: "",
  role: roles[0] ?? "AI Builder",
  interestType: INTEREST_API_VALUES.compete as InterestApiValue,
});

type LandingPageProps = {
  data: LandingPageData;
};

export function LandingPage({ data }: LandingPageProps) {
  const t = useTranslations();
  const l = t.landing;
  const roles = t.roles;

  const navLinks = [
    { href: "#pain", label: l.nav.why },
    { href: "#analogy", label: l.nav.philosophy },
    { href: "#how-it-works", label: l.nav.howItWorks },
    { href: "#first-challenge", label: l.nav.firstChallenge },
    { href: "#leaderboard", label: l.nav.leaderboard },
    { href: "/workflows", label: l.nav.workflows },
    { href: "#audience", label: l.nav.audience },
    { href: "#faq", label: l.nav.faq },
  ];

  const waitlistRef = useRef<HTMLElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [waitlist, setWaitlist] = useState(() => defaultWaitlist(roles));
  const [submitted, setSubmitted] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [highlightInterest, setHighlightInterest] = useState(false);
  const [isWaitlistPending, startWaitlistTransition] = useTransition();

  const betaPercent = Math.round((data.betaSlotsClaimed / data.betaSlotsTotal) * 100);
  const spotsLeft = Math.max(0, data.betaSlotsTotal - data.betaSlotsClaimed);
  const primaryCtaHref = data.challengeOpen ? "/submit" : "#waitlist";
  const primaryCtaLabel = data.challengeOpen ? l.nav.submitEntry : l.nav.joinBeta;
  const statusLabel = translateLandingStatus(data.challengeStatus, t);

  function scrollToWaitlist() {
    waitlistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleInterestSelect(key: InterestKey) {
    setWaitlist((w) => ({ ...w, interestType: INTEREST_API_VALUES[key] }));
    setSubmitted(false);
    setHighlightInterest(true);
    scrollToWaitlist();
    window.setTimeout(() => setHighlightInterest(false), 2000);
  }

  function handleWaitlist(e: FormEvent) {
    e.preventDefault();
    setWaitlistError(null);

    startWaitlistTransition(async () => {
      const result = await joinWaitlist({
        name: waitlist.name,
        email: waitlist.email,
        role: waitlist.role,
        interestType: waitlist.interestType,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setWaitlistError(result.error);
      }
    });
  }

  function handleSubmitAnother() {
    setSubmitted(false);
    setWaitlist(defaultWaitlist(roles));
  }

  function interestLabel(apiValue: string) {
    const key = INTEREST_KEYS.find((k) => INTEREST_API_VALUES[k] === apiValue);
    return key ? l.waitlist.interests[key] : apiValue;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303] text-zinc-100">
      <div className="noise pointer-events-none fixed inset-0 z-0 opacity-60" aria-hidden />
      <div className="grid-bg pointer-events-none fixed inset-0 z-0" aria-hidden />

      <GlowOrb className="left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 bg-emerald-500/20" />
      <GlowOrb className="right-0 top-1/3 h-80 w-80 bg-violet-600/15" />
      <GlowOrb className="bottom-0 left-0 h-96 w-96 bg-cyan-500/10" />

      <header className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#030303]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2 font-mono text-sm font-medium tracking-widest">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-400">
              AI
            </span>
            ARENA
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
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
            <LanguageSwitcher className="hidden sm:flex" />
            <a
              href={primaryCtaHref}
              className="hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 sm:inline-block"
            >
              {primaryCtaLabel}
            </a>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 lg:hidden"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-expanded={mobileNavOpen}
              aria-label={l.nav.menu}
            >
              <span className="sr-only">{l.nav.menu}</span>
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
              {navLinks.map((link) => (
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
                {l.nav.joinBeta}
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-1.5 text-xs text-emerald-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--accent-glow)]" />
            {statusLabel}
            {data.dbAvailable && data.submissionCount > 0 && (
              <span className="text-zinc-500">{l.hero.submissions(data.submissionCount)}</span>
            )}
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            {l.hero.titleLead}{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              {l.hero.titleHighlight}
            </span>{" "}
            {l.hero.titleTail}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            {l.hero.subtitle}
          </p>

          <p className="mt-4 text-sm text-zinc-500">{l.hero.betaCohort}</p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/tournament"
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-6 py-3.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
            >
              {l.hero.firstChallenge}
            </a>
            <a
              href="/submit"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-black"
            >
              {l.hero.submitSolution}
            </a>
            <a
              href="/leaderboard"
              className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:bg-white/[0.04]"
            >
              {l.hero.leaderboard}
            </a>
            <a
              href="/stack-builder"
              className="rounded-full border border-violet-500/30 bg-violet-500/10 px-6 py-3.5 text-sm font-medium text-violet-300"
            >
              {l.hero.workflows}
            </a>
          </div>

          {"narrative" in l && l.narrative && (
            <div className="mt-20 mx-auto max-w-5xl">
              <SectionLabel accent="cyan">{l.narrative.label}</SectionLabel>
              <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">{l.narrative.title}</h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {l.narrative.items.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
                  >
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-16 flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-zinc-500">
            {l.hero.loop.map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="rounded border border-white/10 bg-white/[0.03] px-3 py-1.5 text-zinc-300">
                  {step}
                </span>
                {i < l.hero.loop.length - 1 && <span className="text-zinc-600">→</span>}
              </span>
            ))}
          </div>

          {"paths" in l.hero && l.hero.paths && (
            <div className="mt-12 mx-auto max-w-3xl">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
                {l.hero.pathsTitle}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {l.hero.paths.map((path) => (
                  <Link
                    key={path.href}
                    href={path.href}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
                  >
                    <p className="font-medium text-zinc-200">{path.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{path.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Pain Points */}
        <section id="pain" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>{l.pain.label}</SectionLabel>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              {l.pain.title}
            </h2>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {l.pain.cards.map((card) => (
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

        {/* Poker Analogy */}
        <section id="analogy" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <div>
              <SectionLabel accent="violet">{l.analogy.label}</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {l.analogy.title}
              </h2>
              <div className="mt-6 space-y-4 text-zinc-400 leading-relaxed">
                <p>{l.analogy.p1}</p>
                <p>{l.analogy.p2}</p>
                <p>{l.analogy.p3}</p>
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
                    {l.analogy.chipFooter}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 text-sm">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                      <span className="block text-xs text-zinc-500">{l.analogy.highEv}</span>
                      <span className="text-emerald-400">{l.analogy.highEvValue}</span>
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                      <span className="block text-xs text-zinc-500">{l.analogy.lowEv}</span>
                      <span className="text-red-400/90">{l.analogy.lowEvValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl text-center">
            <SectionLabel>{l.howItWorks.label}</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {l.howItWorks.title}
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {l.howItWorks.steps.map((step) => (
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

        {/* First Challenge — dedicated beta validation */}
        <section id="first-challenge" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <SectionLabel accent="cyan">{l.firstChallenge.label}</SectionLabel>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                  {data.challengeName}
                </h2>
                <p className="mt-4 text-zinc-400 leading-relaxed">{l.firstChallenge.description}</p>
                <p className="mt-3 text-sm font-medium text-emerald-400/90">{l.firstChallenge.betaSelect}</p>
              </div>

              <div className="w-full max-w-xs shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{l.firstChallenge.fillRate}</span>
                  <span className="font-mono text-zinc-300">
                    {data.betaSlotsClaimed}/{data.betaSlotsTotal}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                    style={{ width: `${betaPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  <span className="text-amber-300/90">{l.firstChallenge.spotsRemaining(spotsLeft)}</span>
                </p>
              </div>
            </div>

            <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-xs text-cyan-300">
                    {l.firstChallenge.challengeCode}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-medium ${
                      data.challengeOpen
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>

              <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
                {data.challengeDetails.map((row) => (
                  <div key={row.label} className="bg-[#030303] px-6 py-5 sm:px-8">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {translateChallengeDetailLabel(row.label, t)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {translateChallengeDetailValue(row.label, row.value, t)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href={`/challenge/${data.challengeSlug}`}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
              >
                {l.firstChallenge.viewDetails}
              </Link>
              <Link
                href="/submit"
                className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold text-black"
              >
                {l.firstChallenge.submitSolution}
              </Link>
              <Link
                href="/leaderboard"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-white/[0.04]"
              >
                {l.firstChallenge.leaderboard}
              </Link>
            </div>

            <div className="mt-12">
              <p className="text-center text-sm font-medium text-zinc-300">{l.firstChallenge.participate}</p>
              <p className="mt-1 text-center text-xs text-zinc-500">{l.firstChallenge.participateHint}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {INTEREST_KEYS.map((key) => {
                  const meta = l.waitlist.interestMeta[key];
                  const apiValue = INTEREST_API_VALUES[key];
                  const isActive = waitlist.interestType === apiValue;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleInterestSelect(key)}
                      className={`group rounded-2xl border p-6 text-left transition ${
                        isActive
                          ? "border-emerald-500/50 bg-emerald-500/[0.08] ring-1 ring-emerald-500/30"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-2xl" aria-hidden>
                        {meta.icon}
                      </span>
                      <h3 className="mt-3 text-base font-semibold leading-snug">
                        {l.waitlist.interests[key]}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{meta.description}</p>
                      <span className="mt-4 inline-block text-xs font-medium text-emerald-400 opacity-0 transition group-hover:opacity-100">
                        {l.waitlist.selectContinue}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section id="leaderboard" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>{l.firstChallenge.previewTitle}</SectionLabel>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {l.firstChallenge.previewHeading}
              </h2>
              <a
                href="/leaderboard"
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                {l.firstChallenge.fullLeaderboard}
              </a>
            </div>

            <div className="mt-12 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    <th className="px-6 py-4">{l.firstChallenge.tableRank}</th>
                    <th className="px-6 py-4">{l.firstChallenge.tablePlayer}</th>
                    <th className="px-6 py-4">{l.firstChallenge.tableQuality}</th>
                    <th className="px-6 py-4">{l.firstChallenge.tableCost}</th>
                    <th className="px-6 py-4">{l.firstChallenge.tableScore}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboardPreview.map((row) => (
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
                          <Link
                            href={data.challengeOpen ? "/submit" : "#waitlist"}
                            className="font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            {row.score}
                          </Link>
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

        {/* Audience */}
        <section id="audience" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>{l.audience.label}</SectionLabel>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {l.audience.title}
            </h2>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {l.audience.cards.map((card) => (
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

        {/* Beta waitlist */}
        <section
          id="waitlist"
          ref={waitlistRef}
          className="scroll-mt-24 border-t border-white/[0.06] px-6 py-28"
        >
          <div className="mx-auto max-w-lg">
            <SectionLabel>{l.waitlist.label}</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {l.waitlist.title}
            </h2>
            <p className="mt-4 text-zinc-400">{l.waitlist.subtitle}</p>

            {!data.dbAvailable && (
              <p className="mt-4 text-sm text-amber-300/90">{l.waitlist.dbUnavailable}</p>
            )}

            {submitted ? (
              <div
                className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8"
                role="status"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-xl">
                  ✓
                </div>
                <p className="mt-4 text-lg font-semibold text-emerald-300">{l.waitlist.successTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{l.waitlist.successBody}</p>
                <button
                  type="button"
                  onClick={handleSubmitAnother}
                  className="mt-6 text-sm font-medium text-emerald-400 hover:text-emerald-300"
                >
                  {l.waitlist.submitAnother}
                </button>
              </div>
            ) : (
              <>
              {waitlistError && (
                <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {waitlistError}
                </p>
              )}
              <form onSubmit={handleWaitlist} className="mt-10 space-y-4">
                <div
                  className={`rounded-xl border px-4 py-3 text-sm transition ${
                    highlightInterest
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-white/10 bg-white/[0.02] text-zinc-400"
                  }`}
                >
                  {l.waitlist.interest}:{" "}
                  <span className="font-medium text-white">{interestLabel(waitlist.interestType)}</span>
                </div>

                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-400">
                    {l.waitlist.name}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder={l.waitlist.name}
                    value={waitlist.name}
                    onChange={(e) => setWaitlist((w) => ({ ...w, name: e.target.value }))}
                    className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                    {l.waitlist.email}
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
                    {l.waitlist.role}
                  </label>
                  <select
                    id="role"
                    value={waitlist.role}
                    onChange={(e) => setWaitlist((w) => ({ ...w, role: e.target.value }))}
                    className="h-12 w-full appearance-none rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role} className="bg-zinc-900">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="interestType"
                    className="mb-1.5 block text-xs font-medium text-zinc-400"
                  >
                    {l.waitlist.interest}
                  </label>
                  <select
                    id="interestType"
                    value={waitlist.interestType}
                    onChange={(e) =>
                      setWaitlist((w) => ({
                        ...w,
                        interestType: e.target.value as InterestApiValue,
                      }))
                    }
                    className={`h-12 w-full appearance-none rounded-xl border bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 ${
                      highlightInterest ? "border-emerald-500/50" : "border-white/15"
                    }`}
                  >
                    {INTEREST_KEYS.map((key) => (
                      <option key={key} value={INTEREST_API_VALUES[key]} className="bg-zinc-900">
                        {l.waitlist.interests[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isWaitlistPending || !data.dbAvailable}
                  className="h-12 w-full rounded-full bg-emerald-500 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isWaitlistPending ? l.waitlist.saving : l.waitlist.joinButton}
                </button>
              </form>
              </>
            )}

            <p className="mt-6 text-center text-xs text-zinc-600">{l.waitlist.footer}</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-3xl">
            <SectionLabel>{l.faq.label}</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{l.faq.title}</h2>
            <div className="mt-12 divide-y divide-white/[0.08] rounded-2xl border border-white/10 bg-white/[0.02]">
              {l.faq.items.map((item, i) => {
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

        {/* Final CTA */}
        <section className="border-t border-white/[0.06] px-6 py-28">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-500/[0.08] to-transparent px-8 py-16 text-center sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{l.finalCta.title}</h2>
            <p className="mt-3 text-sm text-zinc-500">{l.finalCta.subtitle}</p>
            <a
              href={primaryCtaHref}
              className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              {primaryCtaLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-mono text-xs tracking-widest text-zinc-500">{l.footer.copyright}</span>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-zinc-500">
            <a href={`/challenge/${data.challengeSlug}`} className="hover:text-zinc-300">
              {l.footer.challenge}
            </a>
            <a href="/submit" className="hover:text-zinc-300">
              {l.footer.submit}
            </a>
            <a href="/leaderboard" className="hover:text-zinc-300">
              {l.footer.leaderboard}
            </a>
            <a href="/workflows" className="hover:text-zinc-300">
              {l.footer.workflows}
            </a>
            <a href="#waitlist" className="hover:text-zinc-300">
              {l.footer.waitlist}
            </a>
            <a href="#faq" className="hover:text-zinc-300">
              {l.footer.faq}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
