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
  ModuleRegistry,
  themeQuartz,
  colorSchemeLightCold,
  colorSchemeDarkBlue
} from 'ag-grid-community';

import { ShellComponent } from '../shell/shell.component';
import { DepartmetsService } from './departmets.service';
import { FormComponent, TabConfig } from '../form/form.component';
import { ThemeService } from '../core/theme/theme.service';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { AG_GRID_LOCALE_PT_BR } from '../calleds/calleds.locale';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    AgGridAngular,
    EmptyStateComponent,
    SkeletonComponent
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.css'
})
export class DepartmentsComponent implements OnInit {

  departments = signal<any[]>([]);
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
    private service: DepartmetsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.buildColumns();
    this.pesquisaDepartamentos();
  }

  buildColumns() {
    this.colDefs = [
      { headerName: 'Cód.', field: 'id', maxWidth: 100, flex: 0, filter: 'agNumberColumnFilter', cellClass: 'cell-id' },
      { headerName: 'Nome', field: 'department', minWidth: 240, filter: 'agTextColumnFilter', cellClass: 'cell-strong' },
      {
        headerName: 'Ações',
        maxWidth: 120,
        minWidth: 100,
        flex: 0,
        sortable: false,
        filter: false,
        cellClass: 'cell-actions',
        cellRenderer: (p: ICellRendererParams) => {
          const id = p.data?.id;
          const div = document.createElement('div');
          div.className = 'row-actions';

          const delBtn = document.createElement('button');
          delBtn.className = 'row-action row-action--danger';
          delBtn.title = 'Excluir departamento';
          delBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">delete</span>`;
          delBtn.addEventListener('click', (e) => { e.stopPropagation(); this.deleteDepartment(id); });
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

  pesquisaDepartamentos() {
    this.loading.set(true);
    this.service.getDepartments().subscribe({
      next: (result) => {
        this.departments.set(result || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar departamentos', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  openDynamicForm() {
    const formConfig: TabConfig[] = [{
      title: 'Cadastro de Departamento',
      fields: [
        { name: 'department', placeholder: 'Nome do departamento', type: 'text', required: true }
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(520px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: 'departments',
        callId: '',
        header: { icon: 'account_tree', eyebrow: 'Novo departamento', title: 'Cadastro de Departamento', subtitle: 'Informe o nome do departamento.' },
        submitLabel: 'Cadastrar departamento',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.pesquisaDepartamentos());
  }

  deleteDepartment(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este departamento?')) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.pesquisaDepartamentos();
        this.snackBar.open('Departamento excluído', 'Fechar', {
          duration: 2500, panelClass: ['snackbar-success']
        });
      },
      error: () => {
        this.snackBar.open('Não foi possível excluir o departamento', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }
}
