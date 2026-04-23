import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-chip" [class]="'status-chip--' + resolvedVariant()">
      <span class="status-chip__dot"></span>
      <span>{{ label }}</span>
    </span>
  `,
  styles: [`
    .status-chip__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      display: inline-block;
    }
  `]
})
export class StatusChipComponent {
  @Input() label: string = '';
  @Input() variant?: ChipVariant;

  resolvedVariant(): ChipVariant {
    if (this.variant) return this.variant;
    const v = (this.label || '').toLowerCase();
    if (/\b(aberto|pendente|aguardando|novo|open)\b/.test(v)) return 'warning';
    if (/\b(em andamento|in progress|processando|capturado)\b/.test(v)) return 'info';
    if (/\b(final|concluído|concluido|resolvido|fechado|closed|done)\b/.test(v)) return 'success';
    if (/\b(cancelado|erro|rejeitado|falha)\b/.test(v)) return 'danger';
    return 'muted';
  }
}
