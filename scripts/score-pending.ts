import "dotenv/config";

import { scorePendingSubmissions } from "../lib/judge/score-submission";

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is required. Add it to .env.local");
    process.exit(1);
  }

  const result = await scorePendingSubmissions(50);
  console.log(
    `Processed ${result.processed} pending — scored: ${result.scored}, failed: ${result.failed}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
