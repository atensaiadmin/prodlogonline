"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LayoutGrid, Lightbulb, Share2, Plus, LogOut } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { ThemeToggle } from "../../components/theme-toggle";
import { createClientSupabase } from "@/lib/supabase-client";

interface AppUser {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
  };
}

interface AppShellProps {
  children: React.ReactNode;
  user: AppUser | null;
}

export function AppShell({ children, user }: AppShellProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClientSupabase();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "You";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* subtle gradient background */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-accent/[0.05] to-transparent" />

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:border-border-strong"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={16} />
            </button>
            <Link href="/dashboard" className="group flex items-center gap-2.5">
              <img
                src="/image/iconalone.png"
                alt="ProdLog"
                className="h-7 w-7 object-contain transition-transform group-hover:-rotate-3"
              />
              <span className="font-display text-lg font-medium tracking-tight text-text">
                prodlog
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/ideas/new" className="btn-primary px-3.5 py-1.5 text-xs">
              <Plus size={14} />
              New idea
            </Link>
            {user && (
              <div className="relative">
                <button
                  aria-label="Account menu"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-white shadow-card transition-transform active:scale-[0.96]"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border bg-surface p-2 shadow-card-hover">
                      <div className="px-2 py-1.5">
                        <p className="truncate text-sm font-medium text-text">
                          {displayName}
                        </p>
                        {user.email && (
                          <p className="truncate text-xs text-text-muted">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 px-4 sm:px-6 md:grid-cols-[220px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] md:block">
          <nav className="mt-4 space-y-1 pr-4">
            <NavLink href="/dashboard" icon={<LayoutGrid size={16} />}>Dashboard</NavLink>
            <NavLink href="/ideas" icon={<Lightbulb size={16} />}>Ideas</NavLink>
            <NavLink href="/share-manage" icon={<Share2 size={16} />}>Share</NavLink>
          </nav>
        </aside>

        {/* Main */}
        <main className="py-6 md:py-8">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-border bg-bg shadow-xl">
            <div className="px-4 pb-4 pt-3">
              <Link href="/dashboard" className="group flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <img
                  src="/image/iconalone.png"
                  alt="ProdLog"
                  className="h-7 w-7 object-contain"
                />
                <span className="font-display text-lg font-medium tracking-tight text-text">
                  prodlog
                </span>
              </Link>
            </div>
            <nav className="px-2 pb-4">
              <NavLink href="/dashboard" icon={<LayoutGrid size={16} />} onNavigate={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink href="/ideas" icon={<Lightbulb size={16} />} onNavigate={() => setMobileOpen(false)}>
                Ideas
              </NavLink>
              <NavLink href="/share-manage" icon={<Share2 size={16} />} onNavigate={() => setMobileOpen(false)}>
                Share
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={clsx(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-accent/10 text-accent"
          : "text-text-secondary hover:bg-surface hover:text-text"
      )}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center text-current">{icon}</span>
      <span className="font-medium">{children}</span>
    </Link>
  );
}
