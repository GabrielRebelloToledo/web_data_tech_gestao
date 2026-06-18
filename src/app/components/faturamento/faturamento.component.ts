import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShellComponent } from '../shell/shell.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { StatusChipComponent } from '../shared/status-chip/status-chip.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { ComboboxComponent } from '../shared/combobox/combobox.component';
import { BillingService } from './billing.service';
import { PermissionsService } from '../core/permissions/permissions.service';

@Component({
  selector: 'app-faturamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    EmptyStateComponent,
    StatusChipComponent,
    SkeletonComponent,
    ComboboxComponent
  ],
  templateUrl: './faturamento.component.html',
  styleUrl: './faturamento.component.css'
})
export class FaturamentoComponent implements OnInit {

  tab = signal<'gerar' | 'lista'>('gerar');

  // ── Gerar fechamento ───────────────────────────────────────────────────
  companies = signal<any[]>([]);
  selectedCompanieId = signal<number | null>(null);
  openItems = signal<any[]>([]);
  loadingOpen = signal<boolean>(false);
  selectedIds = signal<Set<number>>(new Set<number>());
  generating = signal<boolean>(false);

  selectedCompanie = computed(() =>
    this.companies().find((c: any) => Number(c.id) === Number(this.selectedCompanieId())) || null
  );

  valorHora = computed(() => Number(this.selectedCompanie()?.valorHora) || 0);

  selectedHours = computed(() =>
    this.openItems()
      .filter((it: any) => this.selectedIds().has(Number(it.id)))
      .reduce((sum: number, it: any) => sum + (Number(it.hours) || 0), 0)
  );

  liveTotal = computed(() => this.selectedHours() * this.valorHora());

  canGenerate = computed(() =>
    this.selectedIds().size > 0 && this.valorHora() > 0 && !this.generating()
  );

  // ── Faturamentos ───────────────────────────────────────────────────────
  faturamentos = signal<any[]>([]);
  loadingList = signal<boolean>(false);
  statusFilter = signal<string>('');

  statusOptions = [
    { id: '', name: 'Todos' },
    { id: 'ABERTO', name: 'Aberto' },
    { id: 'PAGO', name: 'Pago' }
  ];

  constructor(
    private billing: BillingService,
    private router: Router,
    private snackBar: MatSnackBar,
    public perm: PermissionsService
  ) {}

  canGenerateBilling(): boolean {
    return this.perm.can('FATURAMENTO', 'GERACAO');
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadFaturamentos();
  }

  setTab(t: 'gerar' | 'lista') { this.tab.set(t); }

  // ── Empresas / abertos ─────────────────────────────────────────────────
  loadCompanies() {
    this.billing.getCompanies().subscribe({
      next: (data: any[]) => this.companies.set(data || []),
      error: () => {
        this.snackBar.open('Não foi possível carregar as empresas', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  onCompanieChange(id: number | null) {
    this.selectedCompanieId.set(id != null ? Number(id) : null);
    this.selectedIds.set(new Set<number>());
    this.openItems.set([]);
    if (id == null) return;
    this.loadingOpen.set(true);
    this.billing.getOpen(id).subscribe({
      next: (data: any[]) => {
        this.openItems.set(data || []);
        this.loadingOpen.set(false);
      },
      error: () => {
        this.loadingOpen.set(false);
        this.snackBar.open('Não foi possível carregar os apontamentos em aberto', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(Number(id));
  }

  toggleItem(id: number) {
    const next = new Set(this.selectedIds());
    if (next.has(Number(id))) next.delete(Number(id));
    else next.add(Number(id));
    this.selectedIds.set(next);
  }

  allSelected = computed(() =>
    this.openItems().length > 0 && this.selectedIds().size === this.openItems().length
  );

  toggleAll() {
    if (this.allSelected()) {
      this.selectedIds.set(new Set<number>());
    } else {
      this.selectedIds.set(new Set<number>(this.openItems().map((it: any) => Number(it.id))));
    }
  }

  generate() {
    if (!this.canGenerate()) return;
    const companieId = this.selectedCompanieId();
    if (companieId == null) return;
    this.generating.set(true);
    this.billing.generate({
      companieId,
      apontamentoIds: Array.from(this.selectedIds())
    }).subscribe({
      next: (fat: any) => {
        this.generating.set(false);
        this.snackBar.open('Fechamento gerado', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        if (fat?.id != null) this.router.navigate(['/faturamento', fat.id]);
        else { this.onCompanieChange(companieId); this.loadFaturamentos(); }
      },
      error: (err) => {
        this.generating.set(false);
        const msg = err?.error?.message?.message || 'Não foi possível gerar o fechamento';
        this.snackBar.open(msg, 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });
  }

  // ── Lista de faturamentos ──────────────────────────────────────────────
  loadFaturamentos() {
    this.loadingList.set(true);
    const status = this.statusFilter();
    this.billing.listFaturamentos(status ? { status } : undefined).subscribe({
      next: (data: any[]) => {
        this.faturamentos.set(data || []);
        this.loadingList.set(false);
      },
      error: () => {
        this.loadingList.set(false);
        this.snackBar.open('Não foi possível carregar os faturamentos', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  onStatusFilterChange(value: string) {
    this.statusFilter.set(value);
    this.loadFaturamentos();
  }

  open(id: number) {
    this.router.navigate(['/faturamento', id]);
  }

  num(value: any): number {
    return Number(value) || 0;
  }

  breadcrumbs() {
    return [
      { label: 'Início', route: '/inicio' },
      { label: 'Faturamento' }
    ];
  }
}
