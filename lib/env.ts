/** True when Postgres is configured (runtime / server only). */
export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function isPlaceholderEnvValue(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const v = value.trim().toLowerCase();
  return (
    v.includes("replace_me") ||
    v.includes("your-project") ||
    v.includes("your-anon-key") ||
    v.includes("xxxx.supabase") ||
    v === "sk-ant-..." ||
    v.endsWith("-...")
  );
}

export function hasOpenAiKey(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && !isPlaceholderEnvValue(key));
}

export function hasAnthropicKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return Boolean(key && !isPlaceholderEnvValue(key));
}

export function hasGroqKey(): boolean {
  const key = process.env.GROQ_API_KEY?.trim();
  return Boolean(key && !isPlaceholderEnvValue(key));
}

export function getGroqBaseUrl(): string {
  return process.env.GROQ_BASE_URL?.trim() || "https://api.groq.com/openai/v1";
}

export function getGroqDefaultModel(): string {
  return process.env.GROQ_DEFAULT_MODEL?.trim() || "llama-3.1-8b-instant";
}
