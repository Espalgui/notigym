import { create } from "zustand";

type Theme = "dark" | "light" | "auto";
type ResolvedTheme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const stored = localStorage.getItem("notigym_theme") as Theme | null;
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getSystemTheme(): ResolvedTheme {
  return mediaQuery.matches ? "dark" : "light";
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "auto" ? getSystemTheme() : theme;
}

function applyResolved(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

function persist(theme: Theme) {
  localStorage.setItem("notigym_theme", theme);
}

const initial: Theme = stored || "auto";
const initialResolved = resolve(initial);
applyResolved(initialResolved);
persist(initial);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initial,
  resolvedTheme: initialResolved,
  toggle: () =>
    set((state) => {
      const order: Theme[] = ["light", "dark", "auto"];
      const idx = order.indexOf(state.theme);
      const next = order[(idx + 1) % order.length];
      const resolved = resolve(next);
      applyResolved(resolved);
      persist(next);
      return { theme: next, resolvedTheme: resolved };
    }),
  setTheme: (t) => {
    const resolved = resolve(t);
    applyResolved(resolved);
    persist(t);
    set({ theme: t, resolvedTheme: resolved });
  },
}));

// Listen for OS theme changes when in auto mode
mediaQuery.addEventListener("change", () => {
  const state = useThemeStore.getState();
  if (state.theme === "auto") {
    const resolved = getSystemTheme();
    applyResolved(resolved);
    useThemeStore.setState({ resolvedTheme: resolved });
  }
});
