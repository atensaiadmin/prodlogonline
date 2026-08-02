import type { Metadata } from "next";
import { ThemeToggle } from "../components/theme-toggle";

export const metadata: Metadata = {
  title: "prodlog — shared portfolio",
  description: "Solo founder progress portfolio",
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-accent/[0.05] to-transparent" />
      <header className="border-b border-border/60 bg-bg/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/image/iconalone.png"
              alt="ProdLog"
              className="h-7 w-7 object-contain"
            />
            <span className="font-display text-base font-medium tracking-tight text-text">
              prodlog
            </span>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-muted">
              shared portfolio
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-border/60 py-6 text-center">
        <p className="text-[11px] text-text-muted">
          Built with{" "}
          <a
            href="/"
            className="underline underline-offset-2 hover:text-text"
          >
            prodlog
          </a>
        </p>
      </footer>
    </>
  );
}
