import { createServerPB } from "@/lib/pocketbase-server";
import { PB_URL } from "@/lib/pb";
import { AppShell } from "./components/app-shell";

export const runtime = "edge";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const pb = await createServerPB();
  const record = pb.authStore.isValid ? pb.authStore.record : null;

  const user = record
    ? {
        id: record.id,
        email: (record.email as string | undefined) ?? undefined,
        name: (record.name as string | undefined) ?? undefined,
        avatarUrl: record.avatar
          ? `${PB_URL}/api/files/users/${record.id}/${record.avatar}`
          : null,
      }
    : null;

  return <AppShell user={user}>{children}</AppShell>;
}
