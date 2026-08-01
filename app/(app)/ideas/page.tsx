import { getIdeas, getAddons } from "@/lib/actions";
import { IdeasIndexClient } from "./ideas-index-client";

export const dynamic = "force-dynamic";

export default async function IdeasIndexPage() {
  const [ideas, addons] = await Promise.all([getIdeas(), getAddons("")]);
  const addonCounts: Record<string, number> = {};
  for (const a of addons) addonCounts[a.idea_id] = (addonCounts[a.idea_id] ?? 0) + 1;

  return <IdeasIndexClient initialIdeas={ideas} addonCounts={addonCounts} />;
}
