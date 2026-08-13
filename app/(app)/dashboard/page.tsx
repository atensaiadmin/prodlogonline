import { getIdeas, getAddons, getAllBugs } from "@/lib/actions";
import { STAGES } from "@/lib/schema";
import type { Idea } from "@/lib/schema";
import { DashboardClient } from "./dashboard-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function groupByStage(ideas: Idea[]) {
  const groups: Record<string, Idea[]> = {};
  for (const s of STAGES) groups[s.key] = [];
  for (const idea of ideas) {
    if (groups[idea.stage]) groups[idea.stage].push(idea);
    else groups["inbox"].push(idea);
  }
  return groups;
}

export default async function DashboardPage() {
  const ideas = await getIdeas();
  const addons = await getAddons("");
  const addonCounts: Record<string, number> = {};
  for (const a of addons) {
    addonCounts[a.idea_id] = (addonCounts[a.idea_id] ?? 0) + 1;
  }

  const bugs = await getAllBugs();
  const bugCounts: Record<string, number> = {};
  for (const b of bugs) {
    if (b.status === "open" || b.status === "in_progress") {
      bugCounts[b.idea_id] = (bugCounts[b.idea_id] ?? 0) + 1;
    }
  }

  const grouped = groupByStage(ideas);

  const active = ideas.filter(
    (i) => i.stage !== "inbox" && i.stage !== "dead"
  ).length;

  return (
    <DashboardClient
      initialGroups={grouped}
      stages={STAGES}
      total={ideas.length}
      active={active}
      addonCounts={addonCounts}
      bugCounts={bugCounts}
    />
  );
}
