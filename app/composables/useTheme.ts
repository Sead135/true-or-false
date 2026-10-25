export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "tf-theme";

function preferDark() {
  if (!import.meta.client) {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readStored(): ThemeMode | null {
  if (!import.meta.client) {
    return null;
  }
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "dark" || v === "light" ? v : null;
}

function apply(mode: ThemeMode) {
  if (!import.meta.client) {
    return;
  }
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.style.colorScheme = mode;
}

export function useTheme() {
  const mode = useState<ThemeMode>("theme-mode", () => "light");

  function setTheme(next: ThemeMode) {
    mode.value = next;
    apply(next);
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  function toggleTheme() {
    setTheme(mode.value === "dark" ? "light" : "dark");
  }

  function initTheme() {
    const stored = readStored();
    setTheme(stored ?? (preferDark() ? "dark" : "light"));
  }

  return { mode, setTheme, toggleTheme, initTheme };
}
