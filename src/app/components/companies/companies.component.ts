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
import { CompaniesService } from './companies.service';
import { FormComponent, TabConfig } from '../form/form.component';
import { ThemeService } from '../core/theme/theme.service';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { CompanyLinkageDrawerComponent } from '../shared/linkage/company-linkage-drawer.component';
import { AG_GRID_LOCALE_PT_BR } from '../calleds/calleds.locale';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    AgGridAngular,
    EmptyStateComponent,
    SkeletonComponent,
    CompanyLinkageDrawerComponent
  ],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css'
})
export class CompaniesComponent implements OnInit {

  companies = signal<any[]>([]);
  loading = signal<boolean>(true);
  searchTerm = signal<string>('');

  drawerOpen = signal<boolean>(false);
  selectedCompany = signal<any>(null);

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
    private serviceCompanies: CompaniesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.buildColumns();
    this.pesquisaEmpresas();
  }

  buildColumns() {
    this.colDefs = [
      { headerName: 'Cód.', field: 'id', maxWidth: 100, flex: 0, filter: 'agNumberColumnFilter', cellClass: 'cell-id' },
      { headerName: 'Nome', field: 'name', minWidth: 220, filter: 'agTextColumnFilter', cellClass: 'cell-strong' },
      { headerName: 'CNPJ', field: 'cnpj', minWidth: 170, filter: 'agTextColumnFilter' },
      { headerName: 'Endereço', field: 'adress', minWidth: 220, filter: 'agTextColumnFilter' },
      { headerName: 'E-mail', field: 'email', minWidth: 200, filter: 'agTextColumnFilter' },
      { headerName: 'Telefone', field: 'telephone', minWidth: 140, filter: 'agTextColumnFilter' },
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

          const linkBtn = document.createElement('button');
          linkBtn.className = 'row-action row-action--primary';
          linkBtn.title = 'Gerenciar departamentos e atendentes';
          linkBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">account_tree</span>`;
          linkBtn.addEventListener('click', (e) => { e.stopPropagation(); this.openLinkageDrawer(p.data); });
          div.appendChild(linkBtn);

          const editBtn = document.createElement('button');
          editBtn.className = 'row-action';
          editBtn.title = 'Editar empresa';
          editBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">edit</span>`;
          editBtn.addEventListener('click', (e) => { e.stopPropagation(); this.openEditDialog(p.data); });
          div.appendChild(editBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'row-action row-action--danger';
          delBtn.title = 'Excluir empresa';
          delBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">delete</span>`;
          delBtn.addEventListener('click', (e) => { e.stopPropagation(); this.deleteCompanie(id); });
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

  pesquisaEmpresas() {
    this.loading.set(true);
    this.serviceCompanies.getCompanies().subscribe({
      next: (result) => {
        this.companies.set(result || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar empresas', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  openDynamicForm() {
    const formConfig: TabConfig[] = [{
      title: 'Cadastro de Empresa',
      fields: [
        { name: 'name', placeholder: 'Nome da Empresa', type: 'text', required: true },
        { name: 'cnpj', placeholder: 'CNPJ', type: 'text', required: true },
        { name: 'adress', placeholder: 'Endereço Completo', type: 'text', required: true },
        { name: 'email', placeholder: 'E-mail', type: 'email', required: true },
        { name: 'telephone', placeholder: 'Telefone', type: 'text', required: true },
      ]
    }];

    const dialogRef = this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: 'companies',
        callId: '',
        header: { icon: 'business', eyebrow: 'Nova empresa', title: 'Cadastro de Empresa', subtitle: 'Preencha os dados da empresa atendida.' },
        submitLabel: 'Cadastrar empresa',
        submitIcon: 'check'
      }
    });

    dialogRef.afterClosed().subscribe(() => this.pesquisaEmpresas());
  }

  openEditDialog(company: any) {
    const formConfig: TabConfig[] = [{
      title: 'Editar Empresa',
      fields: [
        { name: 'id', placeholder: 'Cód.', type: 'number', required: true, visible: true, defaultValue: company.id },
        { name: 'name', placeholder: 'Nome da Empresa', type: 'text', required: true, defaultValue: company.name },
        { name: 'cnpj', placeholder: 'CNPJ', type: 'text', required: true, defaultValue: company.cnpj },
        { name: 'adress', placeholder: 'Endereço Completo', type: 'text', required: true, defaultValue: company.adress },
        { name: 'email', placeholder: 'E-mail', type: 'email', required: true, defaultValue: company.email },
        { name: 'telephone', placeholder: 'Telefone', type: 'text', required: true, defaultValue: company.telephone }
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: `companies/update/${company.id}`,
        callId: '',
        header: { icon: 'business', eyebrow: 'Editar empresa', title: 'Editar Empresa', subtitle: 'Atualize os dados da empresa atendida.' },
        submitLabel: 'Salvar alterações',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.pesquisaEmpresas());
  }

  deleteCompanie(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
    this.serviceCompanies.delete(id).subscribe({
      next: () => {
        this.pesquisaEmpresas();
        this.snackBar.open('Empresa excluída', 'Fechar', {
          duration: 2500, panelClass: ['snackbar-success']
        });
      },
      error: () => {
        this.snackBar.open('Não foi possível excluir a empresa', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  openLinkageDrawer(company: any) {
    this.selectedCompany.set(company);
    this.drawerOpen.set(true);
  }

  closeLinkageDrawer() {
    this.drawerOpen.set(false);
  }
}
