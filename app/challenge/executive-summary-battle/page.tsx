import type { Metadata } from "next";

import { ChallengeDetail } from "@/components/challenge/challenge-detail";

export const dynamic = "force-dynamic";
import { DEFAULT_CHALLENGE_SLUG } from "@/lib/constants";
import { getChallengePageData } from "@/lib/queries/challenge-page";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getChallengePageData(DEFAULT_CHALLENGE_SLUG);
  return {
    title: `${data.view.name} | AI ARENA`,
    description: data.view.tagline,
  };
}

export default async function ChallengeDetailPage() {
  const data = await getChallengePageData(DEFAULT_CHALLENGE_SLUG);
  return <ChallengeDetail data={data} />;
}
