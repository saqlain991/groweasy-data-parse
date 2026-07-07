"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-[76px] rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c]" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group flex h-9 items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c] px-2.5 text-[12px] font-bold text-gray-600 dark:text-gray-300 shadow-sm transition-all hover:border-blue-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-md"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-300">
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </span>
      <span className="min-w-9 text-left">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
