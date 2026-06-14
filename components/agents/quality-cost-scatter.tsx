"use client";

import Link from "next/link";

import type { LeaderboardEntry } from "@/lib/agents/types";

type Props = {
  leaderboard: LeaderboardEntry[];
};

const W = 720;
const H = 420;
const PAD = { top: 24, right: 24, bottom: 48, left: 56 };

/** Quality (y) vs cost (x) frontier — agents as dots. Pure SVG, no deps. */
export function QualityCostScatter({ leaderboard }: Props) {
  const costs = leaderboard.map((e) => e.run.costUsd);
  const maxCost = Math.max(...costs) * 1.1;
  const minQ = Math.min(...leaderboard.map((e) => e.score.qualityAdj)) - 5;
  const maxQ = Math.max(...leaderboard.map((e) => e.score.qualityAdj)) + 3;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (cost: number) => PAD.left + (cost / maxCost) * plotW;
  const y = (q: number) => PAD.top + plotH - ((q - minQ) / (maxQ - minQ)) * plotH;

  const xTicks = Array.from({ length: 5 }, (_, i) => (maxCost / 4) * i);
  const yTicks = Array.from({ length: 5 }, (_, i) => minQ + ((maxQ - minQ) / 4) * i);

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img" aria-label="Quality versus cost scatter">
        {/* grid + axes */}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={PAD.left} y1={y(t)} x2={W - PAD.right} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" className="fill-zinc-500" fontSize="11">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={`x${t}`} x={x(t)} y={H - PAD.bottom + 20} textAnchor="middle" className="fill-zinc-500" fontSize="11">
            ${t.toFixed(2)}
          </text>
        ))}
        <text x={W / 2} y={H - 6} textAnchor="middle" className="fill-zinc-400" fontSize="12">
          Cost per run (US$) →
        </text>
        <text x={16} y={H / 2} textAnchor="middle" transform={`rotate(-90 16 ${H / 2})`} className="fill-zinc-400" fontSize="12">
          Quality →
        </text>

        {/* dots */}
        {leaderboard.map((e) => {
          const cx = x(e.run.costUsd);
          const cy = y(e.score.qualityAdj);
          const isTop = e.rank === 1;
          return (
            <g key={e.agent.id}>
              <circle
                cx={cx}
                cy={cy}
                r={isTop ? 8 : 6}
                fill={isTop ? "rgba(52,211,153,0.9)" : "rgba(167,139,250,0.85)"}
                stroke={isTop ? "#34d399" : "#a78bfa"}
                strokeWidth="1.5"
              />
              <text x={cx + 10} y={cy + 4} className="fill-zinc-300" fontSize="11">
                {e.agent.name}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-zinc-500">
        Up and to the left is better — high quality at low cost.{" "}
        <Link href="/agents" className="text-cyan-400 hover:underline">
          View full table
        </Link>
      </p>
    </div>
  );
}
