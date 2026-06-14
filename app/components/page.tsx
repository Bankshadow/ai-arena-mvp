import { Suspense } from "react";

import { ComponentLibraryView } from "@/components/marketplace/component-library-view";

export const metadata = {
  title: "Components | AI ARENA",
  description: "Browse tournament-tested AI workflow components.",
};

export default function ComponentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030303] pt-20 text-center text-zinc-500">Loading…</div>}>
      <ComponentLibraryView />
    </Suspense>
  );
}
