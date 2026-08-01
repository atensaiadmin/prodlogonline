import { notFound } from "next/navigation";
import { getSharedProfileData } from "@/lib/actions";
import SharedViewClient from "./shared-view-client";

export const dynamic = "force-dynamic";

export default async function SharedViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getSharedProfileData(slug);
  if (!data) notFound();

  return <SharedViewClient profile={data.profile} ideas={data.ideas} />;
}
