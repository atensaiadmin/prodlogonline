"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setDark((v) => !v)}
      className={`relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border transition-all duration-300 ${
        dark
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text"
      }`}
    >
      <Sun
        size={16}
        className={`absolute transition-all duration-300 ${dark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}
      />
      <Moon
        size={16}
        className={`absolute transition-all duration-300 ${dark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
    </button>
  );
}

export default ThemeToggle;
