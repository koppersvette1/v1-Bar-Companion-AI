import { useEffect, useState } from 'react';

export type Theme = 'classic' | 'smoker-lab';

const THEME_KEY = 'barbuddy-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return (stored === 'smoker-lab' ? 'smoker-lab' : 'classic') as Theme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('classic', 'smoker-lab');
    root.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, setTheme: setThemeState };
}
