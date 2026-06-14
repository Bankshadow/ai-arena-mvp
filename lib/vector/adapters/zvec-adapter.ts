import { mockVectorAdapter, MockVectorAdapter } from "@/lib/vector/adapters/mock-adapter";
import type { VectorMemoryAdapter } from "@/lib/vector/adapter";

/** MVP 4 stub — delegates to mock until native Zvec is linked. */
export class ZvecVectorAdapter implements VectorMemoryAdapter {
  readonly backend = "zvec" as const;
  private delegate: MockVectorAdapter = mockVectorAdapter;

  createCollection(...args: Parameters<MockVectorAdapter["createCollection"]>) {
    return this.delegate.createCollection(...args);
  }
  upsertDocument(...args: Parameters<MockVectorAdapter["upsertDocument"]>) {
    return this.delegate.upsertDocument(...args);
  }
  upsertDocuments(...args: Parameters<MockVectorAdapter["upsertDocuments"]>) {
    return this.delegate.upsertDocuments(...args);
  }
  searchSimilar(...args: Parameters<MockVectorAdapter["searchSimilar"]>) {
    return this.delegate.searchSimilar(...args);
  }
  deleteDocument(...args: Parameters<MockVectorAdapter["deleteDocument"]>) {
    return this.delegate.deleteDocument(...args);
  }
  getCollectionStats(...args: Parameters<MockVectorAdapter["getCollectionStats"]>) {
    return this.delegate.getCollectionStats(...args);
  }
  rebuildIndex(...args: Parameters<MockVectorAdapter["rebuildIndex"]>) {
    return this.delegate.rebuildIndex(...args);
  }
  clearCollection(...args: Parameters<MockVectorAdapter["clearCollection"]>) {
    return this.delegate.clearCollection(...args);
  }
  async healthCheck() {
    return { ok: true, message: "ZvecVectorAdapter stub — native Zvec not linked; using mock delegate" };
  }
}
