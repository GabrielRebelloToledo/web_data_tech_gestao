import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SetoresService } from './setores.service';

export interface CatalogDialogData {
  companieId: any;
  companieName?: string;
}

@Component({
  selector: 'app-catalog-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="cat-dialog">
    <header class="cat-head">
      <span class="material-symbols-rounded icon-md">inventory_2</span>
      <div>
        <p class="cat-eyebrow">Catálogo de setores</p>
        <h2 class="cat-title">{{ data.companieName || 'Empresa' }}</h2>
        <p class="cat-sub">Setores próprios desta empresa, reutilizáveis na árvore.</p>
      </div>
    </header>

    <div class="cat-add">
      <input type="text" [(ngModel)]="newName" placeholder="Nome do novo setor…"
        (keyup.enter)="add()" />
      <button class="btn-primary-brand btn-sm" (click)="add()" [disabled]="!newName.trim() || saving()">
        <span class="material-symbols-rounded icon-sm">add</span> Adicionar
      </button>
    </div>

    <div class="cat-list" *ngIf="items().length; else empty">
      <div class="cat-item" *ngFor="let it of items()">
        <span class="material-symbols-rounded icon-sm">label</span>
        <span class="cat-item__name">{{ it.department }}</span>
        <button class="row-action row-action--danger" title="Remover do catálogo" (click)="remove(it)">
          <span class="material-symbols-rounded icon-sm">delete</span>
        </button>
      </div>
    </div>
    <ng-template #empty>
      <p class="cat-empty">Nenhum setor no catálogo desta empresa ainda.</p>
    </ng-template>

    <footer class="cat-foot">
      <button class="btn-ghost btn-sm" (click)="ref.close(changed)">Fechar</button>
    </footer>
  </div>
  `,
  styles: [`
    .cat-dialog { display:flex; flex-direction:column; gap:1rem; padding:1.25rem; min-width:min(460px,90vw); }
    .cat-head { display:flex; gap:.75rem; align-items:flex-start; }
    .cat-head .icon-md { color: var(--color-accent); }
    .cat-eyebrow { font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color: var(--color-muted-fg); margin:0; }
    .cat-title { font-size:1.1rem; font-weight:700; margin:.1rem 0; color: var(--color-foreground); }
    .cat-sub { font-size:.82rem; color: var(--color-muted-fg); margin:0; }
    .cat-add { display:flex; gap:.5rem; }
    .cat-add input { flex:1; padding:.5rem .65rem; border:1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-foreground); }
    .cat-list { display:flex; flex-direction:column; gap:.35rem; max-height:46vh; overflow:auto; }
    .cat-item { display:flex; align-items:center; gap:.5rem; padding:.5rem .65rem; border:1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); }
    .cat-item__name { flex:1; color: var(--color-foreground); font-size:.9rem; }
    .cat-empty { font-size:.85rem; color: var(--color-muted-fg); text-align:center; padding:1rem; }
    .cat-foot { display:flex; justify-content:flex-end; border-top:1px solid var(--color-border); padding-top:.85rem; }
    .row-action { border:none; background:transparent; cursor:pointer; color: var(--color-muted-fg); padding:.25rem; border-radius: var(--radius-sm); }
    .row-action--danger:hover { color: var(--color-destructive); }
  `]
})
export class CatalogDialogComponent implements OnInit {
  items = signal<any[]>([]);
  newName = '';
  saving = signal(false);
  changed = false;

  constructor(
    public ref: MatDialogRef<CatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CatalogDialogData,
    private service: SetoresService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.service.getCatalogByOwner({ companieId: this.data.companieId }).subscribe({
      next: (r) => this.items.set(r || []),
      error: () => this.snack.open('Não foi possível carregar o catálogo', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] }),
    });
  }

  add() {
    const name = this.newName.trim();
    if (!name || this.saving()) return;
    this.saving.set(true);
    this.service.createCatalogItem({ department: name, companieId: this.data.companieId }).subscribe({
      next: () => {
        this.newName = '';
        this.saving.set(false);
        this.changed = true;
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message?.message || 'Não foi possível adicionar', 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
      },
    });
  }

  remove(it: any) {
    if (!confirm(`Remover "${it.department}" do catálogo?`)) return;
    this.service.deleteCatalogItem(it.id).subscribe({
      next: () => { this.changed = true; this.load(); },
      error: () => this.snack.open('Não foi possível remover', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] }),
    });
  }
}
