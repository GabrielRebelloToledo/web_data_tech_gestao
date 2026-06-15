import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { KbService } from './kb.service';
import { FormComponent, TabConfig } from '../form/form.component';
import { ThemeService } from '../core/theme/theme.service';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { AG_GRID_LOCALE_PT_BR } from '../calleds/calleds.locale';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-kb',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    AgGridAngular,
    EmptyStateComponent,
    SkeletonComponent
  ],
  templateUrl: './kb.component.html',
  styleUrl: './kb.component.css'
})
export class KbComponent implements OnInit {

  articles = signal<any[]>([]);
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
    private kbService: KbService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.buildColumns();
    this.loadArticles();
  }

  buildColumns() {
    this.colDefs = [
      { headerName: 'Cód.', field: 'id', maxWidth: 100, flex: 0, filter: 'agNumberColumnFilter', cellClass: 'cell-id' },
      { headerName: 'Título', field: 'title', minWidth: 240, filter: 'agTextColumnFilter', cellClass: 'cell-strong' },
      {
        headerName: 'Empresa',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueGetter: (p: ValueGetterParams) => p.data?.companie?.name || '—'
      },
      {
        headerName: 'Setor',
        minWidth: 160,
        filter: 'agTextColumnFilter',
        valueGetter: (p: ValueGetterParams) => p.data?.department?.department || 'Todos'
      },
      {
        headerName: 'Ativo',
        maxWidth: 110,
        minWidth: 90,
        flex: 0,
        filter: 'agTextColumnFilter',
        valueGetter: (p: ValueGetterParams) => p.data?.active === 'S' ? 'Sim' : 'Não'
      },
      {
        headerName: 'Ações',
        maxWidth: 140,
        minWidth: 120,
        flex: 0,
        sortable: false,
        filter: false,
        cellClass: 'cell-actions',
        cellRenderer: (p: ICellRendererParams) => {
          const id = p.data?.id;
          const div = document.createElement('div');
          div.className = 'row-actions';

          const editBtn = document.createElement('button');
          editBtn.className = 'row-action';
          editBtn.title = 'Editar artigo';
          editBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">edit</span>`;
          editBtn.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); this.openEditDialog(p.data); });
          div.appendChild(editBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'row-action row-action--danger';
          delBtn.title = 'Excluir artigo';
          delBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">delete</span>`;
          delBtn.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); this.delete(id); });
          div.appendChild(delBtn);

          return div;
        }
      }
    ];
  }

  onGridReady(e: GridReadyEvent) { this.gridApi = e.api; }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  loadArticles() {
    this.loading.set(true);
    this.kbService.getList().subscribe({
      next: (result: any[]) => {
        this.articles.set(result || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar a base de conhecimento', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  openDynamicForm() {
    const formConfig: TabConfig[] = [{
      title: 'Novo Artigo',
      fields: [
        { name: 'title', placeholder: 'Título', type: 'text', required: true },
        { name: 'problem', placeholder: 'Problema (como se manifesta)', type: 'txtarea', required: true },
        { name: 'solution', placeholder: 'Solução (resposta pré-definida)', type: 'txtarea', required: true },
        { name: 'companieId', placeholder: 'Empresa', type: 'select', required: true, optionsUrl: 'companies/list', labelKey: 'name' },
        { name: 'departmentId', placeholder: 'Setor (opcional — vazio = todos)', type: 'select', required: false, optionsUrl: 'departments/list', labelKey: 'department' },
        { name: 'active', placeholder: 'Ativo', type: 'select', required: false, defaultValue: 'S', options: [{ id: 'S', name: 'Sim' }, { id: 'N', name: 'Não' }] }
      ]
    }];

    const dialogRef = this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: 'kb',
        callId: '',
        header: { icon: 'library_books', eyebrow: 'Novo artigo', title: 'Novo Artigo', subtitle: 'Cadastre uma solução pré-definida na base de conhecimento.' },
        submitLabel: 'Cadastrar artigo',
        submitIcon: 'check'
      }
    });

    dialogRef.afterClosed().subscribe(() => this.loadArticles());
  }

  openEditDialog(article: any) {
    const formConfig: TabConfig[] = [{
      title: 'Editar Artigo',
      fields: [
        { name: 'id', placeholder: 'Cód.', type: 'number', required: true, visible: true, defaultValue: article.id },
        { name: 'title', placeholder: 'Título', type: 'text', required: true, defaultValue: article.title },
        { name: 'problem', placeholder: 'Problema (como se manifesta)', type: 'txtarea', required: true, defaultValue: article.problem },
        { name: 'solution', placeholder: 'Solução (resposta pré-definida)', type: 'txtarea', required: true, defaultValue: article.solution },
        { name: 'companieId', placeholder: 'Empresa', type: 'select', required: true, optionsUrl: 'companies/list', labelKey: 'name', defaultValue: article.companieId },
        { name: 'departmentId', placeholder: 'Setor (opcional — vazio = todos)', type: 'select', required: false, optionsUrl: 'departments/list', labelKey: 'department', defaultValue: article.departmentId },
        { name: 'active', placeholder: 'Ativo', type: 'select', required: false, defaultValue: article.active || 'S', options: [{ id: 'S', name: 'Sim' }, { id: 'N', name: 'Não' }] }
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: `kb/update/${article.id}`,
        callId: '',
        header: { icon: 'library_books', eyebrow: 'Editar artigo', title: 'Editar Artigo', subtitle: 'Atualize a solução pré-definida.' },
        submitLabel: 'Salvar alterações',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.loadArticles());
  }

  delete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    this.kbService.delete(id).subscribe({
      next: () => {
        this.loadArticles();
        this.snackBar.open('Artigo excluído', 'Fechar', {
          duration: 2500, panelClass: ['snackbar-success']
        });
      },
      error: () => {
        this.snackBar.open('Não foi possível excluir o artigo', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }
}
