import Link from "next/link";

import { IndexHealthBadge } from "@/components/vector/index-health-badge";
import type { VectorCollection } from "@/lib/vector/types";

export function CollectionCard({ collection }: { collection: VectorCollection }) {
  return (
    <div className="glass-card rounded-2xl border border-emerald-500/10 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase text-zinc-600">{collection.name}</p>
          <h3 className="mt-1 font-medium text-zinc-100">{collection.label}</h3>
        </div>
        <IndexHealthBadge health={collection.health} />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{collection.description}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-400">
        <span>
          <span className="text-zinc-600">Docs </span>
          <span className="font-mono text-emerald-300">{collection.document_count}</span>
        </span>
        <span>
          <span className="text-zinc-600">Dim </span>
          <span className="font-mono">{collection.dimension}</span>
        </span>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">
        Last indexed{" "}
        {collection.last_indexed_at
          ? new Date(collection.last_indexed_at).toLocaleString()
          : "—"}
      </p>
    </div>
  );
}
