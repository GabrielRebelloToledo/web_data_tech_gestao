import { Injectable, signal, computed } from '@angular/core';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'datatech-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>(this.readInitial());

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    this.apply(this._theme());
  }

  toggle() {
    this.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme) {
    this._theme.set(theme);
    this.apply(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }

  private apply(theme: Theme) {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }

  private readInitial(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  }
}
