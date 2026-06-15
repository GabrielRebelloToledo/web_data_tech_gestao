import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComboboxComponent } from '../shared/combobox/combobox.component';

export interface SetorDialogData {
  mode: 'create' | 'edit';
  companieId: any;
  parentId: any | null;
  parentLabel?: string | null;
  catalog?: any[];          // itens disponíveis (só no create)
  node?: any;               // nó existente (no edit)
}

const WEEK_DAYS = [
  { iso: 1, label: 'Seg' }, { iso: 2, label: 'Ter' }, { iso: 3, label: 'Qua' },
  { iso: 4, label: 'Qui' }, { iso: 5, label: 'Sex' }, { iso: 6, label: 'Sáb' }, { iso: 7, label: 'Dom' },
];

@Component({
  selector: 'app-setor-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ComboboxComponent],
  template: `
  <div class="setor-dialog">
    <header class="sd-head">
      <span class="material-symbols-rounded icon-md">account_tree</span>
      <div>
        <p class="sd-eyebrow">{{ data.mode === 'create' ? 'Novo setor' : 'Editar setor' }}</p>
        <h2 class="sd-title">{{ data.mode === 'create' ? 'Adicionar setor à árvore' : (data.node?.department || 'Setor') }}</h2>
        <p class="sd-sub" *ngIf="data.parentLabel">Dentro de: <strong>{{ data.parentLabel }}</strong></p>
        <p class="sd-sub" *ngIf="!data.parentLabel">Nó raiz</p>
      </div>
    </header>

    <div class="sd-body">
      <!-- Escolha do setor (catálogo) — só no create -->
      <div class="sd-field" *ngIf="data.mode === 'create'">
        <label>Setor (do catálogo)</label>
        <app-combobox
          [options]="data.catalog || []"
          labelKey="department"
          valueKey="id"
          [value]="departmentId()"
          (valueChange)="departmentId.set($event)"
          placeholder="Escolha um setor do catálogo…"
          searchPlaceholder="Buscar setor…"
          emptyMessage="Catálogo vazio — cadastre setores primeiro">
        </app-combobox>
      </div>

      <!-- SLA -->
      <div class="sd-sla">
        <label class="sd-toggle">
          <input type="checkbox" [(ngModel)]="slaEnabled" />
          <span>Definir SLA neste setor</span>
        </label>
        <p class="sd-hint">Se desligado, o setor herda o SLA do nível acima (se houver).</p>

        <div class="sd-sla-fields" *ngIf="slaEnabled">
          <div class="sd-grid2">
            <div class="sd-field">
              <label>1ª resposta (min)</label>
              <input type="number" min="0" [(ngModel)]="slaResponseMinutes" placeholder="ex: 60" />
            </div>
            <div class="sd-field">
              <label>Resolução (min)</label>
              <input type="number" min="0" [(ngModel)]="slaResolutionMinutes" placeholder="ex: 480" />
            </div>
          </div>

          <label class="sd-toggle">
            <input type="checkbox" [(ngModel)]="businessHoursOnly" />
            <span>Contar apenas horário comercial</span>
          </label>

          <div class="sd-grid2" *ngIf="businessHoursOnly">
            <div class="sd-field">
              <label>Início</label>
              <input type="time" [(ngModel)]="businessStart" />
            </div>
            <div class="sd-field">
              <label>Fim</label>
              <input type="time" [(ngModel)]="businessEnd" />
            </div>
          </div>

          <div class="sd-field" *ngIf="businessHoursOnly">
            <label>Dias úteis</label>
            <div class="sd-days">
              <button type="button" *ngFor="let d of weekDays"
                class="sd-day" [class.sd-day--on]="days.has(d.iso)"
                (click)="toggleDay(d.iso)">{{ d.label }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="sd-foot">
      <button class="btn-ghost btn-sm" (click)="close()">Cancelar</button>
      <button class="btn-primary-brand btn-sm" (click)="save()" [disabled]="!canSave()">
        <span class="material-symbols-rounded icon-sm">check</span>
        {{ data.mode === 'create' ? 'Adicionar' : 'Salvar' }}
      </button>
    </footer>
  </div>
  `,
  styles: [`
    .setor-dialog { display:flex; flex-direction:column; gap:1rem; padding:1.25rem; min-width:min(440px,90vw); }
    .sd-head { display:flex; gap:.75rem; align-items:flex-start; }
    .sd-head .icon-md { color: var(--color-accent); }
    .sd-eyebrow { font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color: var(--color-muted-fg); margin:0; }
    .sd-title { font-size:1.1rem; font-weight:700; margin:.1rem 0; color: var(--color-foreground); }
    .sd-sub { font-size:.82rem; color: var(--color-muted-fg); margin:0; }
    .sd-body { display:flex; flex-direction:column; gap:1rem; }
    .sd-field { display:flex; flex-direction:column; gap:.35rem; }
    .sd-field label { font-size:.8rem; font-weight:600; color: var(--color-foreground); }
    .sd-field input { padding:.5rem .65rem; border:1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-foreground); }
    .sd-sla { border-top:1px solid var(--color-border); padding-top:.85rem; display:flex; flex-direction:column; gap:.6rem; }
    .sd-sla-fields { display:flex; flex-direction:column; gap:.75rem; }
    .sd-toggle { display:flex; align-items:center; gap:.5rem; font-size:.88rem; font-weight:600; color: var(--color-foreground); cursor:pointer; }
    .sd-hint { font-size:.76rem; color: var(--color-muted-fg); margin:0; }
    .sd-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:.65rem; }
    .sd-days { display:flex; flex-wrap:wrap; gap:.35rem; }
    .sd-day { padding:.35rem .55rem; border:1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-muted-fg); cursor:pointer; font-size:.8rem; }
    .sd-day--on { background: var(--color-accent); color:#fff; border-color: var(--color-accent); }
    .sd-foot { display:flex; justify-content:flex-end; gap:.5rem; border-top:1px solid var(--color-border); padding-top:.85rem; }
  `]
})
export class SetorFormDialogComponent {
  weekDays = WEEK_DAYS;

  departmentId = signal<any>(null);
  slaEnabled = false;
  slaResponseMinutes: number | null = null;
  slaResolutionMinutes: number | null = null;
  businessHoursOnly = false;
  businessStart = '08:00';
  businessEnd = '18:00';
  days = new Set<number>([1, 2, 3, 4, 5]);

  constructor(
    public ref: MatDialogRef<SetorFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SetorDialogData
  ) {
    if (data.mode === 'edit' && data.node) {
      const n = data.node;
      const sla = n.slaEnabled === 'S';
      this.slaEnabled = sla;
      // No edit, os campos vêm do próprio nó (effectiveSla.source==='self') ou ficam vazios
      const self = n.effectiveSla && n.effectiveSla.source === 'self' ? n.effectiveSla : null;
      if (self) {
        this.slaResponseMinutes = self.slaResponseMinutes ?? null;
        this.slaResolutionMinutes = self.slaResolutionMinutes ?? null;
        this.businessHoursOnly = self.businessHoursOnly === 'S';
        this.businessStart = self.businessStart || '08:00';
        this.businessEnd = self.businessEnd || '18:00';
        if (self.businessDays) this.days = new Set(String(self.businessDays).split(',').map((x: string) => Number(x)));
      }
    }
  }

  toggleDay(iso: number) {
    if (this.days.has(iso)) this.days.delete(iso); else this.days.add(iso);
  }

  canSave(): boolean {
    if (this.data.mode === 'create' && !this.departmentId()) return false;
    return true;
  }

  private buildPayload() {
    const payload: any = {
      slaEnabled: this.slaEnabled ? 'S' : 'N',
    };
    if (this.slaEnabled) {
      payload.slaResponseMinutes = this.slaResponseMinutes ?? null;
      payload.slaResolutionMinutes = this.slaResolutionMinutes ?? null;
      payload.businessHoursOnly = this.businessHoursOnly ? 'S' : 'N';
      payload.businessStart = this.businessHoursOnly ? this.businessStart : null;
      payload.businessEnd = this.businessHoursOnly ? this.businessEnd : null;
      payload.businessDays = this.businessHoursOnly
        ? [...this.days].sort((a, b) => a - b).join(',')
        : null;
    } else {
      payload.slaResponseMinutes = null;
      payload.slaResolutionMinutes = null;
      payload.businessHoursOnly = 'N';
      payload.businessStart = null;
      payload.businessEnd = null;
      payload.businessDays = null;
    }
    if (this.data.mode === 'create') {
      payload.departmentId = this.departmentId();
      payload.companieId = this.data.companieId;
      payload.parentId = this.data.parentId ?? null;
    }
    return payload;
  }

  save() {
    if (!this.canSave()) return;
    this.ref.close(this.buildPayload());
  }

  close() { this.ref.close(null); }
}
