"use client";

import type { ProviderStatus } from "@/lib/tournament/routing/types";

type Props = {
  providers: ProviderStatus[];
  groqRateLimit?: {
    requestsToday: number;
    tokensToday: number;
    requestsPerDayLimit: number | null;
  };
};

export function ProviderStatusCards({ providers, groqRateLimit }: Props) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Provider status
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {providers.map((p) => (
          <div
            key={p.id}
            className={`rounded-xl border p-4 ${
              p.available
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-white/10 bg-black/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-200">{p.label}</span>
              <span
                className={`text-xs ${p.available ? "text-emerald-400" : "text-zinc-500"}`}
              >
                {p.available ? "Ready" : "Unavailable"}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">{p.message}</p>
            {p.id === "groq" && groqRateLimit && (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-zinc-600">Requests today</dt>
                  <dd className="font-mono text-cyan-300">
                    {groqRateLimit.requestsToday}
                    {groqRateLimit.requestsPerDayLimit
                      ? ` / ${groqRateLimit.requestsPerDayLimit}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-600">Tokens today</dt>
                  <dd className="font-mono text-violet-300">
                    {groqRateLimit.tokensToday.toLocaleString()}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
