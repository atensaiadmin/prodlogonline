"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scrollspy for landing sections
  useEffect(() => {
    const ids = ["how-it-works", "use-cases"] as const;
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const linkCls = (id: string) =>
    `text-sm font-medium transition-colors ${
      active === id ? "text-text" : "text-text-secondary hover:text-text"
    }`;

  return (
    <header className={`sticky top-0 z-50 border-b border-border/60 transition-all duration-300 ${scrolled ? "glass_panel shadow-glass-sm" : "bg-bg/95 backdrop-blur-md"}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="sm:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:border-border-strong"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={16} />
          </button>
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 transition-transform duration-300 group-hover:rotate-6">
              <img
                src="/image/iconalone.png"
                alt="ProdLog"
                className="h-6 w-6 object-contain"
              />
            </span>
            <span className="font-display text-lg font-medium tracking-tight text-text">
              prodlog
            </span>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 sm:flex">
          <a href="#how-it-works" className={linkCls("how-it-works")} aria-current={active === "how-it-works" ? "page" : undefined}>
            How it works
          </a>
          <a href="#use-cases" className={linkCls("use-cases")} aria-current={active === "use-cases" ? "page" : undefined}>
            Use cases
          </a>
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-text-secondary transition-colors hover:text-text">
            Sign in
          </Link>
          <Link href="/dashboard" className="btn-primary px-4 py-2 text-sm">
            Get started
          </Link>
        </nav>
      </div>

      {open && (
        <div className="sm:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-border bg-bg shadow-xl">
            <div className="px-4 pb-4 pt-3">
              <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <img
                    src="/image/iconalone.png"
                    alt="ProdLog"
                    className="h-5 w-5 object-contain"
                  />
                </span>
                <span className="font-display text-lg font-medium tracking-tight text-text">
                  prodlog
                </span>
              </Link>
            </div>
            <nav className="px-2 pb-4">
              <a
                href="#how-it-works"
                className={`sidebar-link ${active === "how-it-works" ? "sidebar-link-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                How it works
              </a>
              <a
                href="#use-cases"
                className={`sidebar-link ${active === "use-cases" ? "sidebar-link-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                Use cases
              </a>
              <Link href="/login" className="sidebar-link" onClick={() => setOpen(false)}>
                Sign in
              </Link>
              <Link href="/dashboard" className="btn-primary mt-2 w-full justify-center" onClick={() => setOpen(false)}>
                Get started
              </Link>
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <ThemeToggle />
                <span className="text-xs text-text-muted">Toggle theme</span>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default MarketingHeader;
