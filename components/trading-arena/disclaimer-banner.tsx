export function TradingDisclaimerBanner({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-amber-500/30 bg-amber-500/10 ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      } text-amber-100/90`}
      role="note"
    >
      <strong>Research & backtesting only.</strong> Simulated metrics — not financial advice. Past
      backtests do not guarantee future results. No live trading or brokerage integration in this MVP.
    </div>
  );
}
