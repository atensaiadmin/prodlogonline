import { notFound } from "next/navigation";
import { getIdea, getEntries, getAddons } from "@/lib/actions";
import IdeaDetailPage from "./idea-detail-client";

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

  return <IdeaDetailPage idea={idea} entries={entries} addons={addons} />;
}
