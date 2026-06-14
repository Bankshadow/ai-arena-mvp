"use client";

import Link from "next/link";
import {
  FileText,
  Package,
  Radio,
  ScrollText,
  Shield,
  Users,
} from "lucide-react";

import { ScoreHelpBadge } from "@/components/scoring/score-help";
import {
  MOCK_ADMIN_SUBMISSIONS,
  MOCK_CONSTITUTION_PROPOSALS,
  MOCK_MARKETPLACE_CANDIDATES,
  MOCK_TOURNAMENT_REVIEWS,
} from "@/lib/admin/mock-dashboard";

type Props = {
  liveAvailable: boolean;
};

export function AdminMockDashboard({ liveAvailable }: Props) {
  return (
    <div className="space-y-8">
      {!liveAvailable && (
        <div className="flex items-start gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          <Shield className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Mock admin control room</p>
            <p className="mt-1 text-cyan-200/80">
              Supabase service role is not configured. Showing demo queues so the admin
              surface is never blank. Connect{" "}
              <code className="rounded bg-black/30 px-1">SUPABASE_SERVICE_ROLE_KEY</code> for
              live approve/reject.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pending submissions", value: MOCK_ADMIN_SUBMISSIONS.filter((s) => s.status === "pending").length, icon: Users },
          { label: "Tournament rounds", value: MOCK_TOURNAMENT_REVIEWS.length, icon: Radio },
          { label: "Marketplace candidates", value: MOCK_MARKETPLACE_CANDIDATES.filter((c) => c.status === "pending").length, icon: Package },
          { label: "Constitution proposals", value: MOCK_CONSTITUTION_PROPOSALS.filter((c) => c.status === "pending").length, icon: ScrollText },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl border border-white/10 p-4">
            <s.icon className="size-5 text-violet-400" />
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="glass-card rounded-2xl border border-white/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Users className="size-5 text-amber-400" />
            Submission review queue
          </h2>
          <ScoreHelpBadge system="challenge" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Model</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ADMIN_SUBMISSIONS.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="py-2 pr-4">{s.name}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-zinc-400">{s.model}</td>
                  <td className="py-2 pr-4 capitalize text-amber-300">{s.status}</td>
                  <td className="py-2 text-xs text-zinc-500">
                    {new Date(s.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-card rounded-2xl border border-white/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Radio className="size-5 text-violet-400" />
            Tournament rounds
          </h2>
          <ScoreHelpBadge system="agent_simulation" />
        </div>
        <ul className="mt-4 space-y-2">
          {MOCK_TOURNAMENT_REVIEWS.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2"
            >
              <div>
                <p className="font-medium text-zinc-200">
                  #{r.round} · {r.challengeTitle}
                </p>
                <p className="text-xs text-zinc-500">
                  Winner {r.winner} · {r.score} pts · {r.mode}
                </p>
              </div>
              <Link
                href={`/tournaments/${r.id}`}
                className="text-xs text-cyan-400 hover:underline"
              >
                Replay →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card rounded-2xl border border-white/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Package className="size-5 text-emerald-400" />
              Marketplace candidates
            </h2>
            <ScoreHelpBadge system="marketplace" />
          </div>
          <ul className="mt-4 space-y-2">
            {MOCK_MARKETPLACE_CANDIDATES.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm"
              >
                <p className="font-medium text-zinc-200">{c.name}</p>
                <p className="text-xs text-zinc-500">
                  {c.type} · Arena {c.arenaScore} · Round {c.sourceRound} ·{" "}
                  <span className="capitalize text-amber-300">{c.status}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card rounded-2xl border border-white/10 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="size-5 text-fuchsia-400" />
            Constitution proposals
          </h2>
          <ul className="mt-4 space-y-2">
            {MOCK_CONSTITUTION_PROPOSALS.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-fuchsia-500/15 bg-fuchsia-500/5 px-3 py-2 text-sm"
              >
                <p className="font-medium text-zinc-200">
                  {p.agentName} {p.fromVersion} → {p.toVersion}
                </p>
                <p className="mt-1 text-xs text-zinc-400">{p.summary}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/constitution/proposals"
            className="mt-3 inline-block text-xs text-fuchsia-300 hover:underline"
          >
            View all proposals →
          </Link>
        </section>
      </div>
    </div>
  );
}
