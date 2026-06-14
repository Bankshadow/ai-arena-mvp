import type { EmbeddingProvider } from "@/lib/vector/embedding/types";

const DIM = 384;

function hashToken(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic pseudo-embeddings — no external API. */
export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly model = "mock-hash-v1";
  readonly dimension = DIM;

  async embed(text: string): Promise<number[]> {
    const vec = new Array<number>(DIM).fill(0);
    const tokens = text.toLowerCase().split(/[\s,.:;!?'"()]+/).filter((t) => t.length > 1);
    for (const token of tokens) {
      const h = hashToken(token);
      const idx = h % DIM;
      vec[idx]! += 1 + (h % 100) / 100;
    }
    if (tokens.length === 0) vec[0] = 1;
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}

export const mockEmbeddingProvider = new MockEmbeddingProvider();
