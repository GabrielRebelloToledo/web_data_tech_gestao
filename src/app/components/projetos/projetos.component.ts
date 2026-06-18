import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  ValueGetterParams,
  ModuleRegistry,
  themeQuartz,
  colorSchemeLightCold,
  colorSchemeDarkBlue
} from 'ag-grid-community';

import { ShellComponent } from '../shell/shell.component';
import { ProjetosService } from './projetos.service';
import { FormComponent, TabConfig } from '../form/form.component';
import { ThemeService } from '../core/theme/theme.service';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { AG_GRID_LOCALE_PT_BR } from '../calleds/calleds.locale';

ModuleRegistry.registerModules([AllCommunityModule]);

const STATUS_OPTIONS = [
  { id: 'ATIVO', name: 'Ativo' },
  { id: 'PAUSADO', name: 'Pausado' },
  { id: 'CONCLUIDO', name: 'Concluído' }
];

@Component({
  selector: 'app-projetos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    AgGridAngular,
    EmptyStateComponent,
    SkeletonComponent
  ],
  templateUrl: './projetos.component.html',
  styleUrl: './projetos.component.css'
})
export class ProjetosComponent implements OnInit {

  projects = signal<any[]>([]);
  loading = signal<boolean>(true);
  searchTerm = signal<string>('');

  private gridApi?: GridApi;
  localeText = AG_GRID_LOCALE_PT_BR;

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
    private projetosService: ProjetosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildColumns();
    this.loadProjects();
  }

  private statusLabel(status: string): string {
    const match = STATUS_OPTIONS.find(o => o.id === status);
    return match?.name || status || '—';
  }

  buildColumns() {
    this.colDefs = [
      { headerName: 'Cód.', field: 'id', maxWidth: 100, flex: 0, filter: 'agNumberColumnFilter', cellClass: 'cell-id' },
      { headerName: 'Nome', field: 'name', minWidth: 240, filter: 'agTextColumnFilter', cellClass: 'cell-strong' },
      {
        headerName: 'Empresa',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueGetter: (p: ValueGetterParams) => p.data?.companie?.name || '—'
      },
      {
        headerName: 'Status',
        maxWidth: 150,
        minWidth: 120,
        flex: 0,
        filter: 'agTextColumnFilter',
        valueGetter: (p: ValueGetterParams) => this.statusLabel(p.data?.status),
        cellRenderer: (p: ICellRendererParams) => {
          const status = (p.data?.status || '').toUpperCase();
          const span = document.createElement('span');
          let variant = 'muted';
          if (status === 'ATIVO') variant = 'info';
          else if (status === 'PAUSADO') variant = 'warning';
          else if (status === 'CONCLUIDO') variant = 'success';
          span.className = `status-chip status-chip--${variant}`;
          span.innerHTML = `<span class="status-chip__dot"></span><span>${this.statusLabel(p.data?.status)}</span>`;
          return span;
        }
      },
      {
        headerName: 'Início',
        minWidth: 130,
        filter: 'agDateColumnFilter',
        valueGetter: (p: ValueGetterParams) => this.formatDate(p.data?.startDate)
      },
      {
        headerName: 'Fim',
        minWidth: 130,
        filter: 'agDateColumnFilter',
        valueGetter: (p: ValueGetterParams) => this.formatDate(p.data?.endDate)
      },
      {
        headerName: 'Ações',
        maxWidth: 170,
        minWidth: 150,
        flex: 0,
        sortable: false,
        filter: false,
        cellClass: 'cell-actions',
        cellRenderer: (p: ICellRendererParams) => {
          const id = p.data?.id;
          const div = document.createElement('div');
          div.className = 'row-actions';

          const openBtn = document.createElement('button');
          openBtn.className = 'row-action';
          openBtn.title = 'Abrir projeto';
          openBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">open_in_new</span>`;
          openBtn.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); this.router.navigate(['/projeto', id]); });
          div.appendChild(openBtn);

          const editBtn = document.createElement('button');
          editBtn.className = 'row-action';
          editBtn.title = 'Editar projeto';
          editBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">edit</span>`;
          editBtn.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); this.openEditDialog(p.data); });
          div.appendChild(editBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'row-action row-action--danger';
          delBtn.title = 'Excluir projeto';
          delBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">delete</span>`;
          delBtn.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); this.delete(id); });
          div.appendChild(delBtn);

          return div;
        }
      }
    ];
  }

  private formatDate(value: any): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  }

  onGridReady(e: GridReadyEvent) { this.gridApi = e.api; }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  onRowClicked(event: any) {
    const id = event?.data?.id;
    if (id) this.router.navigate(['/projeto', id]);
  }

  loadProjects() {
    this.loading.set(true);
    this.projetosService.getList().subscribe({
      next: (result: any[]) => {
        this.projects.set(result || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar os projetos', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  openDynamicForm() {
    const formConfig: TabConfig[] = [{
      title: 'Novo Projeto',
      fields: [
        { name: 'name', placeholder: 'Nome do projeto', type: 'text', required: true },
        { name: 'description', placeholder: 'Descrição', type: 'txtarea', required: false },
        { name: 'companieId', placeholder: 'Empresa', type: 'select', required: true, optionsUrl: 'companies/list', labelKey: 'name' },
        { name: 'status', placeholder: 'Status', type: 'select', required: true, defaultValue: 'ATIVO', options: STATUS_OPTIONS },
        { name: 'startDate', placeholder: 'Início', type: 'date', required: false },
        { name: 'endDate', placeholder: 'Fim', type: 'date', required: false }
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: 'projects',
        callId: '',
        skipReload: true,
        header: { icon: 'calendar_month', eyebrow: 'Novo projeto', title: 'Novo Projeto', subtitle: 'Cadastre um projeto e vincule chamados e tarefas.' },
        submitLabel: 'Cadastrar projeto',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.loadProjects());
  }

  openEditDialog(project: any) {
    const formConfig: TabConfig[] = [{
      title: 'Editar Projeto',
      fields: [
        { name: 'id', placeholder: 'Cód.', type: 'number', required: true, visible: true, defaultValue: project.id },
        { name: 'name', placeholder: 'Nome do projeto', type: 'text', required: true, defaultValue: project.name },
        { name: 'description', placeholder: 'Descrição', type: 'txtarea', required: false, defaultValue: project.description },
        { name: 'companieId', placeholder: 'Empresa', type: 'select', required: true, optionsUrl: 'companies/list', labelKey: 'name', defaultValue: project.companieId },
        { name: 'status', placeholder: 'Status', type: 'select', required: true, defaultValue: project.status || 'ATIVO', options: STATUS_OPTIONS },
        { name: 'startDate', placeholder: 'Início', type: 'date', required: false, defaultValue: this.toInputDate(project.startDate) },
        { name: 'endDate', placeholder: 'Fim', type: 'date', required: false, defaultValue: this.toInputDate(project.endDate) }
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: `projects/update/${project.id}`,
        callId: '',
        skipReload: true,
        header: { icon: 'calendar_month', eyebrow: 'Editar projeto', title: 'Editar Projeto', subtitle: 'Atualize os dados do projeto.' },
        submitLabel: 'Salvar alterações',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.loadProjects());
  }

  private toInputDate(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }

  delete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    this.projetosService.delete(id).subscribe({
      next: () => {
        this.loadProjects();
        this.snackBar.open('Projeto excluído', 'Fechar', {
          duration: 2500, panelClass: ['snackbar-success']
        });
      },
      error: () => {
        this.snackBar.open('Não foi possível excluir o projeto', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }
}
