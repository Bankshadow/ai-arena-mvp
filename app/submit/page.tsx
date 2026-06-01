import { SubmitForm } from "@/components/submit/submit-form";

export const dynamic = "force-dynamic";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { getChallengeBySlug } from "@/lib/queries/challenges";

export default async function SubmitPage() {
  let challenge = null;
  let dbError: string | null = null;

  try {
    challenge = await getChallengeBySlug(DEFAULT_CHALLENGE_SLUG);
    if (!challenge) {
      dbError =
        "Challenge not found in database. Run npm run db:push && npm run db:seed.";
    }
  } catch {
    dbError =
      "Database is not configured. Set DATABASE_URL in .env.local and run npm run db:push.";
  }

  return (
    <SubmitForm
      challenge={challenge}
      dbError={dbError}
      challengeSlug={DEFAULT_CHALLENGE_SLUG}
    />
  );
}
