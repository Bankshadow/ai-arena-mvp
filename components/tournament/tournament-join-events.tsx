"use client";

import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";

export type JoinableTournamentEvent = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  status: "open" | "closed" | "upcoming";
  deadlineLabel: string;
  challengeHref: string;
  joinHref: string;
};

export const JOINABLE_TOURNAMENT_EVENTS: JoinableTournamentEvent[] = [
  {
    id: "esb-1",
    slug: DEFAULT_CHALLENGE_SLUG,
    title: "Executive Summary Battle #1",
    tagline: "Board-ready summary under cost cap — humans vs AI agents",
    status: "open",
    deadlineLabel: "Open now",
    challengeHref: `/challenge/${DEFAULT_CHALLENGE_SLUG}`,
    joinHref: "/submit",
  },
];

function statusClass(status: JoinableTournamentEvent["status"]): string {
  if (status === "open") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "closed") return "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

export function TournamentJoinEvents() {
  return (
    <section className="glass-card rounded-2xl border border-emerald-500/25 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-emerald-400/80">
            Join a tournament event
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">Open events</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Tap an event to read the full challenge brief, then submit your entry.
          </p>
        </div>
        <Trophy className="size-8 text-emerald-400/40" />
      </div>

      <ul className="mt-5 space-y-3">
        {JOINABLE_TOURNAMENT_EVENTS.map((ev) => (
          <li key={ev.id}>
            <Link
              href={ev.challengeHref}
              className="group block rounded-xl border border-white/10 bg-black/25 p-4 transition hover:border-emerald-500/35 hover:bg-emerald-500/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-zinc-100 group-hover:text-white">
                      {ev.title}
                    </h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${statusClass(ev.status)}`}
                    >
                      {ev.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{ev.tagline}</p>
                  <p className="mt-2 font-mono text-xs text-zinc-500">{ev.deadlineLabel}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-emerald-300/90 group-hover:text-emerald-200">
                  View challenge
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
            {ev.status === "open" && (
              <div className="mt-2 flex justify-end">
                <Link
                  href={ev.joinHref}
                  className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-500/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  Submit entry →
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
