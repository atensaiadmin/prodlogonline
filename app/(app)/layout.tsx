import { createServerSupabase } from "@/lib/supabase-server";
import { AppShell } from "./components/app-shell";

export const runtime = "edge";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AppShell user={user}>{children}</AppShell>;
}
