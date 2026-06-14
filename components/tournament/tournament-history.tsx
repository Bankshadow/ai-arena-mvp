"use client";

import { useState } from "react";

import type { TournamentEvent } from "@/lib/tournament/types";

const TABS = ["All", "Battles", "Leaderboard", "Marketplace", "System"] as const;

type Tab = (typeof TABS)[number];

type Props = { events: TournamentEvent[]; compact?: boolean };

export function TournamentHistory({ events, compact }: Props) {
  const [tab, setTab] = useState<Tab>("All");

  const filtered = events.filter((e) => {
    if (tab === "All") return true;
    if (tab === "Battles")
      return ["challenges_generated", "challenge_selected", "agents_running", "evaluation_complete"].includes(e.type);
    if (tab === "Leaderboard") return e.type === "leaderboard_updated";
    if (tab === "Marketplace") return e.type === "marketplace_seeded";
    return ["paused", "resumed", "manual_run", "loop_started", "loop_complete", "supabase_save_mock", "supabase_save"].includes(e.type);
  });

  return (
    <section className={compact ? "overflow-hidden rounded-xl border border-white/10" : "glass-card overflow-hidden rounded-2xl"}>
      {!compact && (
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            11 · Replay &amp; history
          </h3>
        </div>
      )}
      <div className={`${compact ? "px-3 py-2" : "border-b border-white/10 px-4 py-3"}`}>
        {!compact && null}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition ${
                tab === t
                  ? "bg-white text-black"
                  : "border border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#0a0a0a] text-left text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Round</th>
              <th className="px-4 py-2">Event</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 40).map((ev) => (
              <tr key={ev.id} className="border-t border-white/5">
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">
                  {new Date(ev.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-violet-300">R{ev.round}</td>
                <td className="px-4 py-2.5 text-zinc-300">{ev.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
