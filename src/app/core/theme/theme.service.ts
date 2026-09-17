import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'nimbus-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly modeSignal = signal<ThemeMode>(this.readInitial());

  readonly mode = this.modeSignal.asReadonly();

  constructor() {
    this.apply(this.modeSignal());
  }

  setTheme(mode: ThemeMode): void {
    this.apply(mode);
    this.modeSignal.set(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore private-mode / storage failures.
    }
  }

  toggle(): void {
    this.setTheme(this.modeSignal() === 'light' ? 'dark' : 'light');
  }

  private readInitial(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // fall through
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark';
  }

  private apply(mode: ThemeMode): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', mode);
  }
}
