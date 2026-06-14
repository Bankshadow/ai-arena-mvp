import type { TradingStrategySpec } from "@/lib/trading-arena/types";

export function generateLeanPythonCode(spec: TradingStrategySpec): string {
  const className = spec.title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24) || "ArenaStrategy";
  const symbols = spec.universe.map((u) => `"${u}"`).join(", ");
  const entry = spec.entry_rules[0] ?? "Custom entry logic";
  const exit = spec.exit_rules[0] ?? "Custom exit logic";

  return `# AI ARENA Trading Strategy Arena — Lean-compatible template (mock)
# Research/backtest only — NOT live trading advice
from AlgorithmImports import *

class ${className}(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2021, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        self.symbols = [self.AddEquity(s, Resolution.${spec.resolution === "daily" ? "Daily" : spec.resolution === "hour" ? "Hour" : "Minute"}).Symbol for s in [${symbols}]]
        self.benchmark = "${spec.benchmark}"
        # Parameters: ${JSON.stringify(spec.parameters)}

    def OnData(self, data):
        # Entry: ${entry}
        # Exit: ${exit}
        # Sizing: ${spec.position_sizing}
        # Risk: ${spec.risk_management.join("; ")}
        pass
`;
}
