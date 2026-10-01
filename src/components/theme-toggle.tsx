"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
};

const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return (
    (window.localStorage.getItem("zizi-theme") as Theme | null) ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
};

const subscribeToTheme = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("zizi-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("zizi-theme-change", callback);
  };
};

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(subscribeToTheme, getStoredTheme, () => "light");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("zizi-theme", next);
    window.dispatchEvent(new Event("zizi-theme-change"));
  };

  return (
    <button
      type="button"
      className="icon-button"
      aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      onClick={toggleTheme}
    >
      {theme === "dark" ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
    </button>
  );
}
