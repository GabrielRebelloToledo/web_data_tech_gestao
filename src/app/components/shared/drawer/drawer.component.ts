import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="drawer" [class.drawer--open]="open" [attr.aria-hidden]="!open" role="dialog" aria-modal="true">
      <div class="drawer__backdrop" (click)="emitClose()"></div>
      <aside class="drawer__panel">
        <header class="drawer__header">
          <div class="drawer__heading">
            <div class="drawer__eyebrow" *ngIf="eyebrow">{{ eyebrow }}</div>
            <h2 class="drawer__title">{{ title }}</h2>
            <p class="drawer__subtitle" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <button class="drawer__close" (click)="emitClose()" aria-label="Fechar">
            <span class="material-symbols-rounded">close</span>
          </button>
        </header>
        <div class="drawer__body">
          <ng-content></ng-content>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .drawer {
      position: fixed;
      inset: 0;
      z-index: 80;
      pointer-events: none;
    }
    .drawer--open { pointer-events: auto; }

    .drawer__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      opacity: 0;
      transition: opacity 220ms ease;
    }
    .drawer--open .drawer__backdrop { opacity: 1; }

    .drawer__panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(480px, 94vw);
      background: var(--color-surface);
      color: var(--color-foreground);
      box-shadow: -12px 0 32px rgba(15, 23, 42, 0.18);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
    }
    .drawer--open .drawer__panel { transform: translateX(0); }

    .drawer__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 24px 24px 18px;
      border-bottom: 1px solid var(--color-border);
      background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%);
    }
    .drawer__heading { min-width: 0; }
    .drawer__eyebrow {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-accent);
      margin-bottom: 4px;
    }
    .drawer__title {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--color-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .drawer__subtitle {
      margin: 0;
      font-size: 13px;
      color: var(--color-muted-fg);
      line-height: 1.4;
    }
    .drawer__close {
      width: 36px;
      height: 36px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-foreground);
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 160ms ease;
    }
    .drawer__close:hover { background: var(--color-muted); }

    .drawer__body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px 28px;
    }

    @media (prefers-reduced-motion: reduce) {
      .drawer__panel { transition: none; }
      .drawer__backdrop { transition: none; }
    }
  `]
})
export class DrawerComponent {
  @Input() open: boolean = false;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() eyebrow?: string;
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() { if (this.open) this.emitClose(); }

  emitClose() { this.close.emit(); }
}
