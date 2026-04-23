import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
  themeQuartz,
  colorSchemeLightCold,
  colorSchemeDarkBlue,
  ICellRendererParams,
  GridApi
} from 'ag-grid-community';

import { CalledsService } from './calleds.service';
import { UserService } from '../core/user/user.service';
import { ThemeService } from '../core/theme/theme.service';
import { StatusChipComponent } from '../shared/status-chip/status-chip.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { AG_GRID_LOCALE_PT_BR } from './calleds.locale';

ModuleRegistry.registerModules([AllCommunityModule]);

type Bucket = 'my' | 'pending' | 'responsible' | 'history' | 'all';

type Row = {
  id: number | string;
  id_number: number | string;
  user_name?: string;
  usuario?: string;
  name?: string;     // empresa (my)
  nameemp?: string;  // empresa (pending)
  empresa?: string;  // empresa (responsible/all)
  reason: string;
  status: string;
};

@Component({
  selector: 'app-calleds',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    StatusChipComponent,
    EmptyStateComponent,
    SkeletonComponent
  ],
  templateUrl: './calleds.component.html',
  styleUrl: './calleds.component.css'
})
export class CalledsComponent implements OnInit {
  // state
  bucket = signal<Bucket>('my');
  loading = signal<boolean>(true);
  rows = signal<Row[]>([]);
  searchTerm = signal<string>('');
  counts = signal<Record<Bucket, number>>({ my: 0, pending: 0, responsible: 0, history: 0, all: 0 });

  private gridApi?: GridApi;
  localeText = AG_GRID_LOCALE_PT_BR;

  type: any;

  tabs: { key: Bucket; label: string; icon: string; adminOnly?: boolean }[] = [
    { key: 'my', label: 'Meus chamados', icon: 'person' },
    { key: 'pending', label: 'Pendentes', icon: 'pending_actions' },
    { key: 'responsible', label: 'Sob minha responsabilidade', icon: 'assignment_ind' },
    { key: 'history', label: 'Histórico atendidos', icon: 'history' },
    { key: 'all', label: 'Todos', icon: 'list_alt', adminOnly: true }
  ];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    minWidth: 120,
    flex: 1
  };

  colDefs: ColDef[] = [];

  private readonly lightTheme = themeQuartz.withPart(colorSchemeLightCold).withParams({
    accentColor: '#0EA5E9',
    foregroundColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    headerBackgroundColor: '#F8FAFC',
    headerFontWeight: 700,
    headerTextColor: '#64748B',
    borderColor: '#E2E8F0',
    oddRowBackgroundColor: '#FAFBFC',
    rowHoverColor: '#E0F2FE',
    fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
    fontSize: 14
  });

  private readonly darkTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
    accentColor: '#38BDF8',
    foregroundColor: '#F1F5F9',
    backgroundColor: '#111827',
    headerBackgroundColor: '#0F172A',
    headerFontWeight: 700,
    headerTextColor: '#94A3B8',
    borderColor: '#1F2937',
    oddRowBackgroundColor: '#0B1220',
    rowHoverColor: 'rgba(56, 189, 248, 0.12)',
    fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
    fontSize: 14
  });

  gridTheme = computed(() => this.themeService.isDark() ? this.darkTheme : this.lightTheme);

  constructor(
    private snackBar: MatSnackBar,
    private service: CalledsService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService
  ) {}

  private readonly validBuckets: Bucket[] = ['my', 'pending', 'responsible', 'history', 'all'];

  ngOnInit(): void {
    this.type = this.userService.user?.type;
    this.buildColumns();

    // Restore bucket from URL query param when present
    const paramTab = this.route.snapshot.queryParamMap.get('tab') as Bucket | null;
    const initial: Bucket = paramTab && this.validBuckets.includes(paramTab) ? paramTab : 'my';
    this.bucket.set(initial);

    this.loadAllCounts();
    this.loadBucket(initial);
  }

  visibleTabs() {
    return this.tabs.filter(t => !t.adminOnly || this.type === 'ADMIN');
  }

  /** Extract the ticket number from any of the endpoint shapes. */
  private pickId(d: any): any {
    return d?.id_number ?? d?.id ?? null;
  }

  /** Extract the requester name from any of the endpoint shapes. */
  private pickRequester(d: any): string {
    return d?.user_name || d?.usuario || d?.user?.name || '—';
  }

  /** Extract the company name from any of the endpoint shapes. */
  private pickCompany(d: any): string {
    return d?.name || d?.nameemp || d?.empresa || d?.primaryCompanie?.name || '—';
  }

  /** Extract the status label from any of the endpoint shapes. */
  private pickStatus(d: any): string {
    const nested = d?.statusId?.status;
    const raw = d?.status;
    if (nested) return nested;
    if (typeof raw === 'string') return raw;
    return '—';
  }

  buildColumns() {
    this.colDefs = [
      {
        headerName: 'Nº',
        maxWidth: 110,
        minWidth: 90,
        flex: 0,
        filter: 'agNumberColumnFilter',
        valueGetter: (p) => this.pickId(p.data),
        cellClass: 'cell-id'
      },
      {
        headerName: 'Solicitante',
        filter: 'agTextColumnFilter',
        valueGetter: (p) => this.pickRequester(p.data),
        minWidth: 160
      },
      {
        headerName: 'Empresa',
        filter: 'agTextColumnFilter',
        valueGetter: (p) => this.pickCompany(p.data),
        minWidth: 160
      },
      {
        headerName: 'Motivo',
        field: 'reason',
        filter: 'agTextColumnFilter',
        minWidth: 220,
        flex: 2,
        cellClass: 'cell-reason',
        tooltipValueGetter: (p) => p.data?.reason
      },
      {
        headerName: 'Status',
        maxWidth: 170,
        minWidth: 140,
        flex: 0,
        filter: 'agTextColumnFilter',
        valueGetter: (p) => this.pickStatus(p.data),
        cellRenderer: (p: ICellRendererParams) => {
          const wrapper = document.createElement('span');
          wrapper.className = 'cell-status';
          const value = p.value || '—';
          const variant = this.statusVariant(value);
          wrapper.innerHTML = `<span class="status-chip status-chip--${variant}"><span class="status-chip__dot"></span>${value}</span>`;
          return wrapper;
        }
      },
      {
        headerName: 'Ações',
        maxWidth: 150,
        minWidth: 130,
        flex: 0,
        sortable: false,
        filter: false,
        cellClass: 'cell-actions',
        cellRenderer: (p: ICellRendererParams) => {
          const id = this.pickId(p.data);
          const div = document.createElement('div');
          div.className = 'row-actions';

          const viewBtn = document.createElement('button');
          viewBtn.className = 'row-action';
          viewBtn.title = 'Abrir chamado';
          viewBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">open_in_new</span>`;
          viewBtn.addEventListener('click', (e) => { e.stopPropagation(); this.openCalled(id); });
          div.appendChild(viewBtn);

          if (this.bucket() === 'pending') {
            const captureBtn = document.createElement('button');
            captureBtn.className = 'row-action row-action--primary';
            captureBtn.title = 'Pegar chamado';
            captureBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">bolt</span>`;
            captureBtn.addEventListener('click', (e) => { e.stopPropagation(); this.capture(id); });
            div.appendChild(captureBtn);
          }

          return div;
        }
      }
    ];
  }

  setBucket(bucket: Bucket) {
    if (bucket === this.bucket()) return;
    this.bucket.set(bucket);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: bucket },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    this.loadBucket(bucket);
  }

  loadBucket(bucket: Bucket) {
    this.loading.set(true);
    this.rows.set([]);
    const u = this.userService.user;
    const req$ = this.fetchFor(bucket, u);
    req$.subscribe({
      next: (result: any[]) => {
        this.rows.set(result || []);
        this.loading.set(false);
        this.counts.update(c => ({ ...c, [bucket]: (result || []).length }));
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar os chamados', 'Fechar', {
          duration: 3500, panelClass: ['snackbar-error']
        });
      }
    });
  }

  private fetchFor(bucket: Bucket, u: any) {
    const id = u?.id, type = u?.type, department = u?.department, companieId = u?.companieId;
    switch (bucket) {
      case 'my': return this.service.getMy(id, type, department, companieId);
      case 'pending': return this.service.getPendents(id, type, department, companieId);
      case 'responsible': return this.service.getResponsable(id, type, department, companieId);
      case 'history': return this.service.getHistoryResponsable(id, type, department, companieId);
      case 'all': return this.service.getAll(id, type, department, companieId);
    }
  }

  /** Background fetch for tab badges — best effort. */
  private loadAllCounts() {
    const u = this.userService.user;
    (['my', 'pending', 'responsible', 'history'] as Bucket[]).forEach(b => {
      this.fetchFor(b, u).subscribe({
        next: (r: any[]) => this.counts.update(c => ({ ...c, [b]: (r || []).length })),
        error: () => {}
      });
    });
    if (u?.type === 'ADMIN') {
      this.fetchFor('all', u).subscribe({
        next: (r: any[]) => this.counts.update(c => ({ ...c, all: (r || []).length })),
        error: () => {}
      });
    }
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  openCalled(id: any) {
    this.router.navigate(['/chamado', id]);
  }

  onRowDoubleClicked(evt: any) {
    const id = this.pickId(evt.data);
    if (id) this.openCalled(id);
  }

  capture(id: any) {
    const userId = this.userService.user?.id;
    this.service.getRespCall(userId, id).subscribe({
      next: () => {
        this.snackBar.open('Chamado capturado com sucesso', 'Fechar', {
          duration: 2500, panelClass: ['snackbar-success']
        });
        this.loadBucket('pending');
        this.loadAllCounts();
      },
      error: () => {
        this.snackBar.open('Não foi possível capturar o chamado', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  refresh() {
    this.loadBucket(this.bucket());
    this.loadAllCounts();
  }

  private statusVariant(value: string): 'success' | 'warning' | 'info' | 'danger' | 'muted' {
    const v = (value || '').toLowerCase();
    if (/\b(aberto|pendente|aguardando|novo|open)\b/.test(v)) return 'warning';
    if (/\b(em andamento|in progress|processando|capturado)\b/.test(v)) return 'info';
    if (/\b(final|concluído|concluido|resolvido|fechado|closed|done)\b/.test(v)) return 'success';
    if (/\b(cancelado|erro|rejeitado|falha)\b/.test(v)) return 'danger';
    return 'muted';
  }
}
