import Link from "next/link";
import { Plus, Share2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-accent/[0.05] to-transparent" />
      <header className="sticky top-0 z-10 border-b border-border/80 bg-bg/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="group flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent font-display text-sm font-semibold text-white shadow-card transition-transform group-hover:-rotate-3">
              p
            </span>
            <span className="font-display text-lg font-medium tracking-tight text-text">
              prodlog
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/share-manage"
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </Link>
            <Link
              href="/ideas/new"
              className="btn-primary px-3.5 py-1.5 text-xs"
            >
              <Plus size={14} />
              New idea
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </>
  );
}
