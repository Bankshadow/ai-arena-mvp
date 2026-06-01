import { MvpSubmitForm } from "@/components/submit/mvp-submit-form";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { hasDatabaseUrl } from "@/lib/env";
import { getChallengeBySlug, parseCostLimit } from "@/lib/queries/challenges";

export default async function SubmitPage() {
  const slug = DEFAULT_CHALLENGE_SLUG;
  const fallbackName = "Executive Summary Battle #1";

  if (!hasDatabaseUrl()) {
    return (
      <MvpSubmitForm
        challengeName={fallbackName}
        dbAvailable={false}
        challengeOpen={false}
        costLimit={1}
        maxAttempts={3}
        statusLabel="Demo"
      />
    );
  }

  try {
    const challenge = await getChallengeBySlug(slug);
    if (!challenge) {
      return (
        <MvpSubmitForm
          challengeName={fallbackName}
          dbAvailable={false}
          challengeOpen={false}
          costLimit={1}
          maxAttempts={3}
          statusLabel="Not found"
        />
      );
    }

    const statusLabel =
      challenge.status === "open"
        ? "Open"
        : challenge.status === "closed"
          ? "Closed"
          : "Beta";

    return (
      <MvpSubmitForm
        challengeSlug={challenge.slug}
        challengeName={challenge.name}
        dbAvailable
        challengeOpen={challenge.status === "open"}
        costLimit={parseCostLimit(challenge.costLimitUsd)}
        maxAttempts={challenge.maxAttempts}
        statusLabel={statusLabel}
      />
    );
  } catch {
    return (
      <MvpSubmitForm
        challengeName={fallbackName}
        dbAvailable={false}
        challengeOpen={false}
        costLimit={1}
        maxAttempts={3}
        statusLabel="Offline"
      />
    );
  }
}
