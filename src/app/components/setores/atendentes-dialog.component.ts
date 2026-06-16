import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComboboxComponent } from '../shared/combobox/combobox.component';
import { SetoresService } from './setores.service';

export interface AtendentesDialogData {
  idDepartComp: any;
  nodeName?: string;
}

@Component({
  selector: 'app-atendentes-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ComboboxComponent],
  template: `
  <div class="at-dialog">
    <header class="at-head">
      <span class="material-symbols-rounded icon-md">group</span>
      <div>
        <p class="at-eyebrow">Atendentes do nó</p>
        <h2 class="at-title">{{ data.nodeName || 'Setor' }}</h2>
        <p class="at-sub">Defina quem atende chamados deste nível — por usuário ou por grupo.</p>
      </div>
    </header>

    <div class="at-body">
      <!-- Usuários -->
      <section class="at-section">
        <div class="at-section__head">
          <span class="material-symbols-rounded icon-sm">person</span>
          <h3>Usuários</h3>
        </div>

        <div class="at-loading" *ngIf="loadingUsers()">Carregando…</div>

        <ng-container *ngIf="!loadingUsers()">
          <div class="at-list" *ngIf="nodeUsers().length; else noUsers">
            <div class="at-item" *ngFor="let u of nodeUsers()">
              <span class="material-symbols-rounded icon-sm">person</span>
              <span class="at-item__name">{{ u.user?.name || u.user?.email || 'Usuário' }}</span>
              <button class="row-action row-action--danger" title="Remover usuário"
                (click)="removeUser(u)" [disabled]="busy()">
                <span class="material-symbols-rounded icon-sm">delete</span>
              </button>
            </div>
          </div>
          <ng-template #noUsers>
            <p class="at-empty">Nenhum usuário vinculado a este nó.</p>
          </ng-template>

          <div class="at-add">
            <app-combobox
              [options]="availableUsers()"
              labelKey="name"
              valueKey="id"
              [value]="selectedUserId()"
              (valueChange)="selectedUserId.set($event)"
              placeholder="Escolha um usuário…"
              searchPlaceholder="Buscar usuário…"
              emptyMessage="Nenhum usuário disponível">
            </app-combobox>
            <button class="btn-primary-brand btn-sm" (click)="addUser()"
              [disabled]="!selectedUserId() || busy()">
              <span class="material-symbols-rounded icon-sm">add</span> Adicionar
            </button>
          </div>
        </ng-container>
      </section>

      <!-- Grupos de usuários -->
      <section class="at-section">
        <div class="at-section__head">
          <span class="material-symbols-rounded icon-sm">groups</span>
          <h3>Grupos de usuários</h3>
        </div>

        <div class="at-loading" *ngIf="loadingGroups()">Carregando…</div>

        <ng-container *ngIf="!loadingGroups()">
          <div class="at-list" *ngIf="nodeGroups().length; else noGroups">
            <div class="at-item" *ngFor="let g of nodeGroups()">
              <span class="material-symbols-rounded icon-sm">groups</span>
              <span class="at-item__name">{{ g.group?.name || 'Grupo' }}</span>
              <button class="row-action row-action--danger" title="Remover grupo"
                (click)="removeGroup(g)" [disabled]="busy()">
                <span class="material-symbols-rounded icon-sm">delete</span>
              </button>
            </div>
          </div>
          <ng-template #noGroups>
            <p class="at-empty">Nenhum grupo vinculado a este nó.</p>
          </ng-template>

          <div class="at-add">
            <app-combobox
              [options]="availableGroups()"
              labelKey="name"
              valueKey="id"
              [value]="selectedGroupId()"
              (valueChange)="selectedGroupId.set($event)"
              placeholder="Escolha um grupo…"
              searchPlaceholder="Buscar grupo…"
              emptyMessage="Nenhum grupo disponível">
            </app-combobox>
            <button class="btn-primary-brand btn-sm" (click)="addGroup()"
              [disabled]="!selectedGroupId() || busy()">
              <span class="material-symbols-rounded icon-sm">add</span> Vincular
            </button>
          </div>
        </ng-container>
      </section>
    </div>

    <footer class="at-foot">
      <button class="btn-ghost btn-sm" (click)="ref.close()">Fechar</button>
    </footer>
  </div>
  `,
  styles: [`
    .at-dialog { display:flex; flex-direction:column; gap:1rem; padding:1.25rem; min-width:min(480px,90vw); }
    .at-head { display:flex; gap:.75rem; align-items:flex-start; }
    .at-head .icon-md { color: var(--color-accent); }
    .at-eyebrow { font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color: var(--color-muted-fg); margin:0; }
    .at-title { font-size:1.1rem; font-weight:700; margin:.1rem 0; color: var(--color-foreground); }
    .at-sub { font-size:.82rem; color: var(--color-muted-fg); margin:0; }
    .at-body { display:flex; flex-direction:column; gap:1.25rem; }
    .at-section { display:flex; flex-direction:column; gap:.6rem; border-top:1px solid var(--color-border); padding-top:.85rem; }
    .at-section__head { display:flex; align-items:center; gap:.45rem; }
    .at-section__head h3 { font-size:.92rem; font-weight:700; margin:0; color: var(--color-foreground); }
    .at-section__head .icon-sm { color: var(--color-muted-fg); }
    .at-loading { font-size:.82rem; color: var(--color-muted-fg); padding:.5rem 0; }
    .at-list { display:flex; flex-direction:column; gap:.35rem; max-height:32vh; overflow:auto; }
    .at-item { display:flex; align-items:center; gap:.5rem; padding:.5rem .65rem; border:1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); }
    .at-item .icon-sm { color: var(--color-muted-fg); }
    .at-item__name { flex:1; color: var(--color-foreground); font-size:.9rem; }
    .at-empty { font-size:.85rem; color: var(--color-muted-fg); padding:.5rem 0; margin:0; }
    .at-add { display:flex; gap:.5rem; align-items:flex-end; }
    .at-add app-combobox { flex:1; }
    .at-foot { display:flex; justify-content:flex-end; border-top:1px solid var(--color-border); padding-top:.85rem; }
    .row-action { border:none; background:transparent; cursor:pointer; color: var(--color-muted-fg); padding:.25rem; border-radius: var(--radius-sm); }
    .row-action:disabled { opacity:.5; cursor:not-allowed; }
    .row-action--danger:hover { color: var(--color-destructive); }
  `]
})
export class AtendentesDialogComponent implements OnInit {
  nodeUsers = signal<any[]>([]);
  nodeGroups = signal<any[]>([]);
  allUsers = signal<any[]>([]);
  allGroups = signal<any[]>([]);

  selectedUserId = signal<any>(null);
  selectedGroupId = signal<any>(null);

  loadingUsers = signal(true);
  loadingGroups = signal(true);
  busy = signal(false);

  availableUsers = computed(() => {
    const linked = new Set(this.nodeUsers().map((u: any) => u.userId ?? u.user?.id));
    return this.allUsers().filter((u: any) => !linked.has(u.id));
  });

  availableGroups = computed(() => {
    const linked = new Set(this.nodeGroups().map((g: any) => g.userGroupId ?? g.group?.id));
    return this.allGroups().filter((g: any) => !linked.has(g.id));
  });

  constructor(
    public ref: MatDialogRef<AtendentesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AtendentesDialogData,
    private service: SetoresService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadGroups();

    this.service.getAllUsers().subscribe({
      next: (r) => this.allUsers.set(r || []),
      error: () => this.allUsers.set([]),
    });
    this.service.getAllUserGroups().subscribe({
      next: (r) => this.allGroups.set(r || []),
      error: () => this.allGroups.set([]),
    });
  }

  private err(msg: string) {
    this.snack.open(msg, 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
  }

  loadUsers() {
    this.loadingUsers.set(true);
    this.service.listNodeUsers(this.data.idDepartComp).subscribe({
      next: (r) => { this.nodeUsers.set(r || []); this.loadingUsers.set(false); },
      error: () => { this.loadingUsers.set(false); this.err('Não foi possível carregar os usuários do nó'); },
    });
  }

  loadGroups() {
    this.loadingGroups.set(true);
    this.service.listNodeGroups(this.data.idDepartComp).subscribe({
      next: (r) => { this.nodeGroups.set(r || []); this.loadingGroups.set(false); },
      error: () => { this.loadingGroups.set(false); this.err('Não foi possível carregar os grupos do nó'); },
    });
  }

  addUser() {
    const userId = this.selectedUserId();
    if (!userId || this.busy()) return;
    this.busy.set(true);
    this.service.addNodeUser(this.data.idDepartComp, userId).subscribe({
      next: () => { this.busy.set(false); this.selectedUserId.set(null); this.loadUsers(); },
      error: (e) => { this.busy.set(false); this.err(e?.error?.message?.message || 'Não foi possível adicionar o usuário'); },
    });
  }

  removeUser(u: any) {
    if (this.busy()) return;
    this.busy.set(true);
    this.service.removeNodeUser(u.idDepCompUser).subscribe({
      next: () => { this.busy.set(false); this.loadUsers(); },
      error: () => { this.busy.set(false); this.err('Não foi possível remover o usuário'); },
    });
  }

  addGroup() {
    const groupId = this.selectedGroupId();
    if (!groupId || this.busy()) return;
    this.busy.set(true);
    this.service.linkNodeGroup(this.data.idDepartComp, groupId).subscribe({
      next: () => { this.busy.set(false); this.selectedGroupId.set(null); this.loadGroups(); },
      error: (e) => { this.busy.set(false); this.err(e?.error?.message?.message || 'Não foi possível vincular o grupo'); },
    });
  }

  removeGroup(g: any) {
    if (this.busy()) return;
    this.busy.set(true);
    this.service.unlinkNodeGroup(g.id).subscribe({
      next: () => { this.busy.set(false); this.loadGroups(); },
      error: () => { this.busy.set(false); this.err('Não foi possível remover o grupo'); },
    });
  }
}
