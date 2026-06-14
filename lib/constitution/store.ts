import {
  getConstitutionRecordByAgentId,
  getConstitutionRecordById,
  getConstitutionVersion,
  getCurrentConstitution,
  getMockConstitutionRecords,
} from "@/lib/constitution/mock-data";
import { computeConstitutionScore } from "@/lib/constitution/scoring";
import type {
  AgentConstitution,
  AgentConstitutionRecord,
  ConstitutionFormInput,
  ConstitutionVersionLabel,
} from "@/lib/constitution/types";

const STORAGE_KEY = "ai-arena-constitution-records";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function cloneRecords(records: AgentConstitutionRecord[]): AgentConstitutionRecord[] {
  return JSON.parse(JSON.stringify(records)) as AgentConstitutionRecord[];
}

/** In-memory + localStorage store — Supabase-ready interface. */
export class ConstitutionStore {
  private records: AgentConstitutionRecord[];

  constructor() {
    this.records = cloneRecords(getMockConstitutionRecords());
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) this.records = JSON.parse(raw) as AgentConstitutionRecord[];
      } catch {
        /* keep defaults */
      }
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch {
      /* quota */
    }
  }

  list(): AgentConstitutionRecord[] {
    return cloneRecords(this.records);
  }

  getById(id: string): AgentConstitutionRecord | undefined {
    return cloneRecords(this.records).find((r) => r.id === id);
  }

  getByAgentId(agentId: string): AgentConstitutionRecord | undefined {
    return cloneRecords(this.records).find((r) => r.agentId === agentId);
  }

  getVersion(constitutionId: string, version: ConstitutionVersionLabel): AgentConstitution | undefined {
    const record = this.records.find((r) => r.id === constitutionId);
    if (!record) return undefined;
    return getConstitutionVersion(record, version);
  }

  saveVersion(
    constitutionId: string,
    input: ConstitutionFormInput,
  ): AgentConstitution {
    const idx = this.records.findIndex((r) => r.id === constitutionId);
    const now = new Date().toISOString();
    const score = computeConstitutionScore(input as AgentConstitution);

    const versionDoc: AgentConstitution = {
      ...input,
      id: `${constitutionId}-${input.version}`,
      constitutionId,
      constitutionScore: score,
      createdAt: now,
      updatedAt: now,
    };

    if (idx === -1) {
      const record: AgentConstitutionRecord = {
        id: constitutionId,
        agentId: input.agentId,
        agentName: input.agentName,
        agentType: input.agentType,
        currentVersion: input.version,
        versions: [versionDoc],
        createdAt: now,
        updatedAt: now,
      };
      this.records.push(record);
    } else {
      const record = this.records[idx]!;
      const vIdx = record.versions.findIndex((v) => v.version === input.version);
      if (vIdx >= 0) {
        record.versions[vIdx] = { ...versionDoc, createdAt: record.versions[vIdx]!.createdAt };
      } else {
        record.versions.push(versionDoc);
      }
      record.currentVersion = input.version;
      record.updatedAt = now;
    }

    this.persist();
    return versionDoc;
  }

  createRecord(input: ConstitutionFormInput): AgentConstitutionRecord {
    const id = `const-${input.agentId}-${newId().slice(0, 8)}`;
    this.saveVersion(id, input);
    return this.getById(id)!;
  }

  resetToMock(): void {
    this.records = cloneRecords(getMockConstitutionRecords());
    this.persist();
  }
}

/** Server-safe read-only accessors (mock data). */
export function listConstitutionRecords(): AgentConstitutionRecord[] {
  return getMockConstitutionRecords();
}

export function resolveConstitutionForAgent(
  agentId: string,
  version?: ConstitutionVersionLabel,
): AgentConstitution | undefined {
  const record = getConstitutionRecordByAgentId(agentId);
  if (!record) return undefined;
  if (version) return getConstitutionVersion(record, version);
  return getCurrentConstitution(record);
}

export function resolveConstitutionById(
  constitutionId: string,
  version?: ConstitutionVersionLabel,
): AgentConstitution | undefined {
  const record = getConstitutionRecordById(constitutionId);
  if (!record) return undefined;
  if (version) return getConstitutionVersion(record, version);
  return getCurrentConstitution(record);
}
