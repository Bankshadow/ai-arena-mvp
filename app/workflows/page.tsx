import { WorkflowsPageShell } from "@/components/workflows/workflows-page-shell";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { MOCK_WORKFLOWS } from "@/lib/data/mock-mvp";
import { hasDatabaseUrl } from "@/lib/env";
import { getTopWorkflowsByChallengeSlug } from "@/lib/queries/workflows";

export const metadata = {
  title: "Workflow Library | AI ARENA",
  description: "Top workflows from Executive Summary Battle #1",
};

export default async function WorkflowsPage() {
  let workflows = MOCK_WORKFLOWS;
  let source: "database" | "mock" = "mock";

  if (hasDatabaseUrl()) {
    try {
      const fromDb = await getTopWorkflowsByChallengeSlug(DEFAULT_CHALLENGE_SLUG, 3);
      if (fromDb && fromDb.length > 0) {
        workflows = fromDb;
        source = "database";
      }
    } catch {
      /* use mock */
    }
  }

  return <WorkflowsPageShell workflows={workflows} source={source} />;
}
