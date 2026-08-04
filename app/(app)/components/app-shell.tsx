"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LayoutGrid, Lightbulb, Share2, Plus, LogOut, Sparkles } from "lucide-react";
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
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-accent/[0.04] to-transparent" />

      {/* Top bar */}
      <header className="sticky top-0 z-20 glass_panel shadow-glass-sm border-b border-border/30">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface/80 text-text-secondary hover:border-border-strong transition-colors"
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
            <Link
              href="/ideas/new"
              className="group btn-primary px-3.5 py-1.5 text-xs font-semibold"
            >
              <Plus size={14} className="transition-transform duration-300 group-hover:rotate-90" />
              <span className="hidden sm:inline ml-0.5">New idea</span>
            </Link>
            {user && (
              <div className="relative">
                <button
                  aria-label="Account menu"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-bold text-white shadow-card transition-transform active:scale-[0.96]"
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
                    <div className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-border/60 bg-surface p-2.5 shadow-card-hover backdrop-blur-sm">
                      <div className="px-3 py-2.5 border-b border-border/40 mb-1">
                        <p className="truncate text-base font-semibold text-text">
                          {displayName}
                        </p>
                        {user.email && (
                          <p className="truncate text-sm text-text-muted mt-0.5">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
                      >
                        <LogOut size={16} />
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
          <nav className="mt-5 space-y-1 pr-3">
            <NavLink href="/dashboard" icon={<LayoutGrid size={15} />}>Dashboard</NavLink>
            <NavLink href="/ideas" icon={<Lightbulb size={15} />}>Ideas</NavLink>
            <NavLink href="/share-manage" icon={<Share2 size={15} />}>Share</NavLink>

            <div className="mt-6 border-t border-border pt-3">
              <p className="mb-2 px-2.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-text-muted">Quick actions</p>
              <Link
                href="/ideas/new"
                className="sidebar-link"
              >
                <Plus size={14} />
                New idea
              </Link>
            </div>

            <div className="mt-5">
              <div className="mx-2.5 rounded-lg border border-accent/20 bg-accent-subtle p-3 shadow-sm">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-accent" />
                  <span className="text-xs font-medium text-accent">Building momentum</span>
                </div>
                <p className="text-[11px] leading-relaxed text-text-secondary">
                  Log a quick entry on your top idea to keep the streak alive.
                </p>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="py-7 md:py-8 min-h-[calc(100dvh-56px)]">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-border/50 bg-bg shadow-2xl">
            <div className="px-4 pb-4 pt-3.5 border-b border-border/40">
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
            <nav className="px-2.5 pb-4 pt-3 space-y-1">
              <NavLink href="/dashboard" icon={<LayoutGrid size={15} />} onNavigate={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink href="/ideas" icon={<Lightbulb size={15} />} onNavigate={() => setMobileOpen(false)}>
                Ideas
              </NavLink>
              <NavLink href="/share-manage" icon={<Share2 size={15} />} onNavigate={() => setMobileOpen(false)}>
                Share
              </NavLink>
              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-2 px-2.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-text-muted">Quick actions</p>
                <Link href="/ideas/new" className="sidebar-link" onClick={() => setMobileOpen(false)}>
                  <Plus size={14} /> New idea
                </Link>
              </div>
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
        "sidebar-link relative",
        active && "sidebar-link-active"
      )}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center text-current">{icon}</span>
      <span className="font-medium text-xs">{children}</span>
      {active && (
        <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
      )}
    </Link>
  );
}
