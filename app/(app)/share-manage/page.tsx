import { getShareProfiles, getIdeas, getAllProfileIdeaIds } from "@/lib/actions";
import ShareManagerClient from "./share-manager-client";

export const dynamic = "force-dynamic";

export default async function ShareManagePage() {
  const profiles = await getShareProfiles();
  const ideas = await getIdeas();
  const profileIdeaIds = await getAllProfileIdeaIds();
  return (
    <ShareManagerClient
      profiles={profiles}
      ideas={ideas}
      profileIdeaIds={profileIdeaIds}
    />
  );
}
