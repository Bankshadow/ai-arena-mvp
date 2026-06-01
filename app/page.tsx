import { LandingPage } from "@/components/landing/landing-page";
import { getLandingPageData } from "@/lib/landing/get-landing-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getLandingPageData();
  return <LandingPage data={data} />;
}
