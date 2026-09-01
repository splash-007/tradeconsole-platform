// PREFERENCES SERVICE
// Frontend abstraction for user preferences.
// Persistence is currently isolated behind this service.
// Replace the localStorage calls with API calls once the backend is ready.
//
// Future API:
//   GET  /api/v1/preferences
//   PUT  /api/v1/preferences
//   POST /api/v1/preferences/theme

export type ThemePreference = 'light' | 'dark' | 'system';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ar' | 'zh' | 'ja';
export type DisplayCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'BTC' | 'ETH';
export type NumberFormat = 'en-US' | 'de-DE' | 'fr-FR';
export type MarketDefaultView = 'all' | 'forex' | 'crypto' | 'indices' | 'commodities';
export type ChartType = 'candlestick' | 'line' | 'bar' | 'area';
export type ChartInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export interface UserPreferences {
  theme: ThemePreference;
  language: LanguageCode;
  timezone: string;
  displayCurrency: DisplayCurrency;
  numberFormat: NumberFormat;
  marketDefaultView: MarketDefaultView;
  chartType: ChartType;
  chartInterval: ChartInterval;
  showPnlInHeader: boolean;
  compactTables: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  displayCurrency: 'USD',
  numberFormat: 'en-US',
  marketDefaultView: 'all',
  chartType: 'candlestick',
  chartInterval: '1h',
  showPnlInHeader: true,
  compactTables: false,
};

const PREFS_STORAGE_KEY = 'tc-user-preferences';
const THEME_STORAGE_KEY = 'tc-theme';

function applyThemeToDOM(theme: ThemePreference): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.remove('light');
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    // system
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    root.classList.toggle('light', !prefersDark);
  }
}

export const preferencesService = {
  /**
   * Load preferences for the current user.
   * BACKEND INTEGRATION: GET /api/v1/preferences
   * Returns stored preferences or defaults.
   */
  getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch {}
    return { ...DEFAULT_PREFERENCES };
  },

  /**
   * Save all preferences.
   * BACKEND INTEGRATION: PUT /api/v1/preferences
   */
  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
    }
    if (prefs.theme !== undefined) {
      this.applyTheme(prefs.theme);
    }
    return updated;
  },

  /**
   * Get current theme preference.
   * Checks legacy key for backward compatibility.
   */
  getTheme(): ThemePreference {
    if (typeof window === 'undefined') return 'light';
    try {
      const prefs = this.getPreferences();
      if (prefs.theme) return prefs.theme;
      // Legacy key fallback
      const legacy = localStorage.getItem(THEME_STORAGE_KEY);
      if (legacy === 'dark') return 'dark';
      if (legacy === 'light') return 'light';
    } catch {}
    return 'light';
  },

  /**
   * Set and apply theme.
   * BACKEND INTEGRATION: POST /api/v1/preferences/theme
   */
  applyTheme(theme: ThemePreference): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      // Also update in preferences object
      try {
        const prefs = this.getPreferences();
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ ...prefs, theme }));
      } catch {}
    }
    applyThemeToDOM(theme);
  },

  /**
   * Toggle between light and dark.
   */
  toggleTheme(): ThemePreference {
    const current = this.getTheme();
    const next: ThemePreference = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    return next;
  },

  /**
   * Initialize theme on app load.
   * Should be called once at startup.
   */
  initTheme(): void {
    const theme = this.getTheme();
    applyThemeToDOM(theme);
  },
};
