"use client";

import { Sun, Moon, LayoutDashboard, Wrench, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

export function TopNav() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark";
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", next);
  };

  return (
    <header className="w-full px-4 py-3 border-b bg-background dark:bg-[#0e0e0e] shadow-sm flex justify-between items-center">
      <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
        <LayoutDashboard className="w-5 h-5" />
        LinkGuard Lite
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <button className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500">
            <Wrench className="w-4 h-4" />
            Tools
          </button>
          <div className="absolute top-8 right-0 hidden group-hover:flex flex-col bg-white dark:bg-[#1a1a1a] text-sm shadow-md border rounded-md w-48 z-10">
            <a
              href="#"
              className="px-4 py-2 hover:bg-muted dark:hover:bg-gray-800 flex items-center justify-between"
            >
              Link Checker
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="px-4 py-2 hover:bg-muted dark:hover:bg-gray-800 flex items-center justify-between"
            >
              Coming Soon
              <Wrench className="w-4 h-4" />
            </a>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
