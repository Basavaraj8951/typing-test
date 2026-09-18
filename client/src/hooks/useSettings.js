import { useEffect, useState } from 'react';

const STORAGE_KEY = 'typingpro.settings';

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light'
  fontSize: 'medium', // 'small' | 'medium' | 'large'
  duration: 30, // default seconds for Time mode
  soundEnabled: false,
  showKeyboard: true,
  caretStyle: 'block', // 'block' | 'line' | 'underline'
  smoothAnimations: true,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Could not read settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.warn('Could not save settings to localStorage:', err);
    }
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    document.documentElement.setAttribute(
      'data-animations',
      settings.smoothAnimations ? 'on' : 'off'
    );
  }, [settings.theme, settings.fontSize, settings.smoothAnimations]);

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTheme() {
    setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }

  return { settings, updateSetting, toggleTheme };
}
