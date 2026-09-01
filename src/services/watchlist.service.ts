// BACKEND INTEGRATION:
// GET    /api/v1/watchlist
// POST   /api/v1/watchlist
// DELETE /api/v1/watchlist/:symbol

const WATCHLIST_STORAGE_KEY = 'tc-watchlist-v1';

export interface WatchlistEntry {
  symbol: string;
  addedAt: string;
}

function readStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeStorage(symbols: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(symbols));
  } catch {}
}

export const watchlistService = {
  /**
   * Returns the list of watched symbols.
   * BACKEND: GET /api/v1/watchlist → { symbols: string[] }
   */
  getWatchlist(): string[] {
    return readStorage();
  },

  /**
   * Adds an instrument to the watchlist.
   * BACKEND: POST /api/v1/watchlist  body: { symbol }
   */
  addInstrument(symbol: string): void {
    const current = readStorage();
    if (!current.includes(symbol)) {
      writeStorage([...current, symbol]);
    }
  },

  /**
   * Removes an instrument from the watchlist.
   * BACKEND: DELETE /api/v1/watchlist/:symbol
   */
  removeInstrument(symbol: string): void {
    const current = readStorage();
    writeStorage(current.filter(s => s !== symbol));
  },

  /**
   * Returns true if the symbol is currently watched.
   */
  isWatched(symbol: string): boolean {
    return readStorage().includes(symbol);
  },

  /**
   * Toggles the watched state of a symbol.
   * Returns the new watched state.
   */
  toggle(symbol: string): boolean {
    if (watchlistService.isWatched(symbol)) {
      watchlistService.removeInstrument(symbol);
      return false;
    } else {
      watchlistService.addInstrument(symbol);
      return true;
    }
  },
};
