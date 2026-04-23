import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <span class="material-symbols-rounded">{{ icon }}</span>
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__description" *ngIf="description">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: var(--color-muted-fg);
    }
    .empty-state__icon {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-lg);
      background: var(--color-accent-soft);
      color: var(--color-accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .empty-state__icon .material-symbols-rounded { font-size: 32px !important; }
    .empty-state__title {
      margin: 0 0 6px;
      font-size: 17px;
      font-weight: 700;
      color: var(--color-foreground);
    }
    .empty-state__description {
      margin: 0;
      max-width: 320px;
      font-size: 14px;
      line-height: 1.5;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nada por aqui';
  @Input() description?: string;
}
