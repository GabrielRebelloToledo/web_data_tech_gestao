import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShellComponent } from '../shell/shell.component';
import { ComboboxComponent } from '../shared/combobox/combobox.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { SetoresService } from './setores.service';
import { SetorFormDialogComponent } from './setor-form-dialog.component';
import { CatalogDialogComponent } from './catalog-dialog.component';

@Component({
  selector: 'app-setores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    ComboboxComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  templateUrl: './setores.component.html',
  styleUrl: './setores.component.css',
})
export class SetoresComponent implements OnInit {
  companies = signal<any[]>([]);
  selectedCompanieId = signal<any>(null);
  tree = signal<any[]>([]);
  catalog = signal<any[]>([]);

  loadingCompanies = signal(true);
  loadingTree = signal(false);
  collapsed = signal<Set<number>>(new Set());

  constructor(
    private service: SetoresService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.service.getCompanies().subscribe({
      next: (r) => {
        this.companies.set(r || []);
        this.loadingCompanies.set(false);
      },
      error: () => {
        this.loadingCompanies.set(false);
        this.snack.open('Não foi possível carregar as empresas', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      },
    });
  }

  get selectedCompany() {
    return this.companies().find((c) => c.id === this.selectedCompanieId());
  }

  onCompanyChange(id: any) {
    this.selectedCompanieId.set(id);
    if (id) this.loadTree();
    else { this.tree.set([]); this.catalog.set([]); }
  }

  loadTree() {
    const id = this.selectedCompanieId();
    if (!id) return;
    this.loadingTree.set(true);
    this.service.getTree(id).subscribe({
      next: (r) => { this.tree.set(r || []); this.loadingTree.set(false); },
      error: () => {
        this.loadingTree.set(false);
        this.snack.open('Não foi possível carregar a árvore', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      },
    });
    this.service.getAvailableCatalog(id).subscribe({
      next: (r) => this.catalog.set(r || []),
      error: () => this.catalog.set([]),
    });
  }

  // ── collapse/expand ─────────────────────────────────────────────────
  toggle(nodeId: number) {
    const s = new Set(this.collapsed());
    if (s.has(nodeId)) s.delete(nodeId); else s.add(nodeId);
    this.collapsed.set(s);
  }
  isCollapsed(nodeId: number) { return this.collapsed().has(nodeId); }

  // ── SLA chip ────────────────────────────────────────────────────────
  slaLabel(node: any): string | null {
    const sla = node?.effectiveSla;
    if (!sla) return null;
    const parts: string[] = [];
    if (sla.slaResolutionMinutes) parts.push(`resol. ${this.fmtMin(sla.slaResolutionMinutes)}`);
    if (sla.slaResponseMinutes) parts.push(`1ª resp. ${this.fmtMin(sla.slaResponseMinutes)}`);
    if (!parts.length) return 'SLA';
    return parts.join(' · ');
  }
  slaInherited(node: any): boolean { return node?.effectiveSla?.source === 'inherited'; }

  private fmtMin(min: number): string {
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h${m}` : `${h}h`;
  }

  // ── ações ───────────────────────────────────────────────────────────
  addRoot() { this.openNodeDialog('create', null, null); }
  addChild(node: any) { this.openNodeDialog('create', node.idDepartComp, node.department); }
  editNode(node: any) { this.openNodeDialog('edit', node.parentId, null, node); }

  private openNodeDialog(mode: 'create' | 'edit', parentId: any, parentLabel: any, node?: any) {
    const ref = this.dialog.open(SetorFormDialogComponent, {
      panelClass: 'shell-dialog',
      maxWidth: '94vw',
      data: {
        mode,
        companieId: this.selectedCompanieId(),
        parentId,
        parentLabel,
        catalog: this.catalog(),
        node,
      },
    });

    ref.afterClosed().subscribe((payload) => {
      if (!payload) return;
      const obs = mode === 'create'
        ? this.service.createNode(payload)
        : this.service.updateNode(node.idDepartComp, payload);
      obs.subscribe({
        next: () => {
          this.snack.open(mode === 'create' ? 'Setor adicionado' : 'Setor atualizado', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
          this.loadTree();
        },
        error: (err) => this.snack.open(err?.error?.message?.message || 'Operação falhou', 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] }),
      });
    });
  }

  deleteNode(node: any) {
    const hasChildren = node.children?.length;
    const msg = hasChildren
      ? `Excluir "${node.department}" e TODOS os ${node.children.length} subsetores?`
      : `Excluir o setor "${node.department}"?`;
    if (!confirm(msg)) return;
    this.service.deleteNode(node.idDepartComp).subscribe({
      next: () => {
        this.snack.open('Setor excluído', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.loadTree();
      },
      error: () => this.snack.open('Não foi possível excluir', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] }),
    });
  }

  openCatalog() {
    const ref = this.dialog.open(CatalogDialogComponent, {
      panelClass: 'shell-dialog',
      maxWidth: '94vw',
      data: { companieId: this.selectedCompanieId(), companieName: this.selectedCompany?.name },
    });
    ref.afterClosed().subscribe((changed) => { if (changed) this.loadTree(); });
  }
}
