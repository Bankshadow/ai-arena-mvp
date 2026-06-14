"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, LogIn, LogOut } from "lucide-react";

import { Nav } from "@/components/Nav";
import {
  clearUserEmailCookie,
  getUserEmailFromDocument,
  setUserEmailCookie,
} from "@/lib/auth/user-cookie";
import type { SavedBattleRecord } from "@/lib/battle/saved-battle";
import type { SubmissionRow } from "@/lib/supabase/types";
import type { SavedTournamentRecord } from "@/lib/tournament/saved-tournament";

type HistoryResponse = {
  email: string;
  submissions: SubmissionRow[];
  battles: SavedBattleRecord[];
  tournamentRounds: SavedTournamentRecord[];
  source: "supabase" | "local";
};

export function AccountView() {
  const [email, setEmail] = useState("");
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = getUserEmailFromDocument();
    if (saved) {
      setEmail(saved);
      void loadHistory(saved);
    }
  }, []);

  async function loadHistory(targetEmail: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/history?email=${encodeURIComponent(targetEmail)}`);
      const data = (await res.json()) as HistoryResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load history");
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    setUserEmailCookie(normalized);
    void loadHistory(normalized);
  }

  function handleSignOut() {
    clearUserEmailCookie();
    setHistory(null);
    setEmail("");
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <Nav />

      <main className="relative mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400/80">
          MVP18 · Your activity
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold">
          <History className="size-8 text-violet-400" />
          Account history
        </h1>
        <p className="mt-2 text-zinc-400">
          Sign in with the email you use on Submit — view submissions, battles, and tournament
          rounds tied to your address.
        </p>

        <form onSubmit={handleSignIn} className="mt-6 flex flex-wrap gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="min-w-[240px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200"
          >
            <LogIn className="size-4" />
            Load history
          </button>
          {history && (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          )}
        </form>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {loading && <p className="mt-6 text-sm text-zinc-500">Loading…</p>}

        {history && !loading && (
          <div className="mt-8 space-y-6">
            <Section title={`Submissions (${history.submissions.length})`}>
              {history.submissions.length === 0 ? (
                <Empty hint="No submissions for this email yet." href="/submit" label="Submit solution" />
              ) : (
                <ul className="divide-y divide-white/10">
                  {history.submissions.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <span>{s.challenge_id}</span>
                      <span className="capitalize text-zinc-400">{s.status}</span>
                      <span className="font-mono text-cyan-300">
                        {s.final_score != null ? s.final_score.toFixed(1) : "—"}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title={`Battles (${history.battles.length})`}>
              {history.battles.length === 0 ? (
                <Empty hint="No battles yet." href="/battle" label="Run a battle" />
              ) : (
                <ul className="divide-y divide-white/10">
                  {history.battles.map((b) => (
                    <li key={b.id} className="py-3 text-sm">
                      <Link href={`/battles/${b.id}`} className="text-cyan-300 hover:underline">
                        {b.challenge.title}
                      </Link>
                      <span className="ml-2 text-xs text-zinc-500">{b.mode}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title={`Tournament rounds (${history.tournamentRounds.length})`}>
              {history.tournamentRounds.length === 0 ? (
                <Empty hint="No saved tournament rounds." href="/tournament" label="Open tournament" />
              ) : (
                <ul className="divide-y divide-white/10">
                  {history.tournamentRounds.map((r) => (
                    <li key={r.id} className="py-3 text-sm">
                      <Link href={`/tournaments/${r.id}`} className="text-violet-300 hover:underline">
                        Round {r.round} · {r.mode}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Empty({ hint, href, label }: { hint: string; href: string; label: string }) {
  return (
    <p className="text-sm text-zinc-500">
      {hint}{" "}
      <Link href={href} className="text-cyan-400 hover:underline">
        {label}
      </Link>
    </p>
  );
}
