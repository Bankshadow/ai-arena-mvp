import type { TournamentEvidence } from "@/lib/marketplace/types";

type Props = { evidence: TournamentEvidence[] };

export function EvidenceTable({ evidence }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-4 py-3">Round</th>
            <th className="px-4 py-3">Tournament</th>
            <th className="px-4 py-3">Challenge</th>
            <th className="px-4 py-3 text-right">Score</th>
            <th className="px-4 py-3 text-right">Cost</th>
            <th className="px-4 py-3 text-right">Tokens</th>
            <th className="px-4 py-3 text-right">Latency</th>
            <th className="px-4 py-3">Result</th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((row) => (
            <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-mono text-violet-300">R{row.round}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-500">{row.tournament_id}</td>
              <td className="px-4 py-3 text-zinc-300">{row.challenge_title}</td>
              <td className="px-4 py-3 text-right font-mono text-emerald-300">{row.score}</td>
              <td className="px-4 py-3 text-right font-mono text-cyan-300">
                ${row.cost_usd.toFixed(4)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-zinc-400">
                {row.tokens.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-mono text-zinc-400">{row.latency_ms}ms</td>
              <td className="px-4 py-3">
                <span
                  className={
                    row.passed
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                >
                  {row.passed ? "Pass" : "Review"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
