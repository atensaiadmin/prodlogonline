import { notFound } from "next/navigation";
import { getIdea, getEntries, getAddons, getBugs } from "@/lib/actions";
import IdeaDetailPage from "./idea-detail-client";

export const runtime = "edge";

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await getIdea(id);
  if (!idea) notFound();

  const entries = await getEntries(id);
  const addons = await getAddons(id);
  const bugs = await getBugs(id);

  return <IdeaDetailPage idea={idea} entries={entries} addons={addons} bugs={bugs} />;
}
