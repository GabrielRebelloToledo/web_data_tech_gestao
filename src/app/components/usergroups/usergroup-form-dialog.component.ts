import { CommonModule } from '@angular/common';
import { Component, Inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface UserGroupUser {
  id: number;
  name: string;
  email: string;
  type?: string;
}

export interface UserGroupDialogData {
  mode: 'create' | 'edit';
  group?: any;
  users: UserGroupUser[];
}

export interface UserGroupDialogResult {
  name: string;
  active: string;
  userIds: number[];
}

@Component({
  selector: 'app-usergroup-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="ug-dialog">
    <header class="ug-head">
      <span class="material-symbols-rounded icon-md">groups</span>
      <div>
        <p class="ug-eyebrow">{{ data.mode === 'create' ? 'Novo grupo' : 'Editar grupo' }}</p>
        <h2 class="ug-title">{{ data.mode === 'create' ? 'Adicionar grupo de usuários' : (data.group?.name || 'Grupo') }}</h2>
        <p class="ug-sub">Conjunto reutilizável de atendentes.</p>
      </div>
    </header>

    <div class="ug-body">
      <div class="ug-grid2">
        <div class="ug-field">
          <label>Nome</label>
          <input type="text" [(ngModel)]="name" placeholder="Ex: Suporte Nível 1" maxlength="120" />
        </div>
        <div class="ug-field">
          <label>Ativo</label>
          <select [(ngModel)]="active">
            <option value="S">Sim</option>
            <option value="N">Não</option>
          </select>
        </div>
      </div>

      <div class="ug-field">
        <div class="ug-members-head">
          <label>Membros</label>
          <span class="ug-count">{{ selectedIds().size }} selecionado(s)</span>
        </div>

        <label class="ug-search">
          <span class="material-symbols-rounded icon-sm">search</span>
          <input type="search" [(ngModel)]="searchValue" placeholder="Buscar por nome ou e-mail…" />
        </label>

        <div class="ug-list">
          <label class="ug-item" *ngFor="let u of filteredUsers()">
            <input type="checkbox"
                   [checked]="selectedIds().has(u.id)"
                   (change)="toggle(u.id)" />
            <div class="ug-item-info">
              <span class="ug-item-name">{{ u.name }}</span>
              <span class="ug-item-email">{{ u.email }}</span>
            </div>
          </label>

          <p class="ug-empty" *ngIf="filteredUsers().length === 0">Nenhum usuário encontrado.</p>
        </div>
      </div>
    </div>

    <footer class="ug-foot">
      <button class="btn-ghost btn-sm" (click)="close()">Cancelar</button>
      <button class="btn-primary-brand btn-sm" (click)="save()" [disabled]="!canSave()">
        <span class="material-symbols-rounded icon-sm">check</span>
        {{ data.mode === 'create' ? 'Adicionar' : 'Salvar' }}
      </button>
    </footer>
  </div>
  `,
  styles: [`
    .ug-dialog { display:flex; flex-direction:column; gap:1rem; padding:1.25rem; min-width:min(520px,92vw); }
    .ug-head { display:flex; gap:.75rem; align-items:flex-start; }
    .ug-head .icon-md { color: var(--color-accent); }
    .ug-eyebrow { font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color: var(--color-muted-fg); margin:0; }
    .ug-title { font-size:1.1rem; font-weight:700; margin:.1rem 0; color: var(--color-foreground); }
    .ug-sub { font-size:.82rem; color: var(--color-muted-fg); margin:0; }
    .ug-body { display:flex; flex-direction:column; gap:1rem; }
    .ug-grid2 { display:grid; grid-template-columns:2fr 1fr; gap:.65rem; }
    .ug-field { display:flex; flex-direction:column; gap:.35rem; }
    .ug-field label { font-size:.8rem; font-weight:600; color: var(--color-foreground); }
    .ug-field input, .ug-field select { padding:.5rem .65rem; border:1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-foreground); }
    .ug-members-head { display:flex; align-items:center; justify-content:space-between; }
    .ug-count { font-size:.76rem; color: var(--color-muted-fg); }
    .ug-search { display:flex; align-items:center; gap:.4rem; padding:.45rem .6rem; border:1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); }
    .ug-search .icon-sm { color: var(--color-muted-fg); }
    .ug-search input { flex:1; border:none; outline:none; background:transparent; color: var(--color-foreground); font-size:.88rem; }
    .ug-list { display:flex; flex-direction:column; max-height:300px; overflow-y:auto; border:1px solid var(--color-border); border-radius: var(--radius-sm); }
    .ug-item { display:flex; align-items:center; gap:.65rem; padding:.5rem .65rem; cursor:pointer; border-bottom:1px solid var(--color-border); }
    .ug-item:last-child { border-bottom:none; }
    .ug-item:hover { background: var(--color-surface); }
    .ug-item input { width:1rem; height:1rem; accent-color: var(--color-accent); }
    .ug-item-info { display:flex; flex-direction:column; gap:.1rem; min-width:0; }
    .ug-item-name { font-size:.88rem; font-weight:600; color: var(--color-foreground); }
    .ug-item-email { font-size:.76rem; color: var(--color-muted-fg); }
    .ug-empty { padding:.75rem; font-size:.82rem; color: var(--color-muted-fg); margin:0; text-align:center; }
    .ug-foot { display:flex; justify-content:flex-end; gap:.5rem; border-top:1px solid var(--color-border); padding-top:.85rem; }
  `]
})
export class UsergroupFormDialogComponent {
  name = '';
  active = 'S';
  search = signal<string>('');
  selectedIds = signal<Set<number>>(new Set<number>());

  // ngModel binding for the search field through a getter/setter
  get searchValue(): string { return this.search(); }
  set searchValue(v: string) { this.search.set(v); }

  filteredUsers = computed<UserGroupUser[]>(() => {
    const term = this.search().trim().toLowerCase();
    const users = this.data.users || [];
    if (!term) return users;
    return users.filter((u: UserGroupUser) =>
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  });

  constructor(
    public ref: MatDialogRef<UsergroupFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserGroupDialogData
  ) {
    if (data.mode === 'edit' && data.group) {
      this.name = data.group.name || '';
      this.active = data.group.active || 'S';
      const members: any[] = data.group.members || [];
      const ids = members
        .map((m: any) => Number(m.userId))
        .filter((id: number) => !Number.isNaN(id));
      this.selectedIds.set(new Set<number>(ids));
    }
  }

  toggle(id: number): void {
    this.selectedIds.update((set: Set<number>) => {
      const next = new Set<number>(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  canSave(): boolean {
    return this.name.trim().length > 0;
  }

  save(): void {
    if (!this.canSave()) return;
    const result: UserGroupDialogResult = {
      name: this.name.trim(),
      active: this.active,
      userIds: [...this.selectedIds()]
    };
    this.ref.close(result);
  }

  close(): void { this.ref.close(null); }
}
