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
import { UsersService } from './users.service';
import { FormComponent, TabConfig } from '../form/form.component';
import { ThemeService } from '../core/theme/theme.service';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { StatusChipComponent } from '../shared/status-chip/status-chip.component';
import { UserLinkageDrawerComponent } from '../shared/linkage/user-linkage-drawer.component';
import { AG_GRID_LOCALE_PT_BR } from '../calleds/calleds.locale';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    AgGridAngular,
    EmptyStateComponent,
    SkeletonComponent,
    StatusChipComponent,
    UserLinkageDrawerComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  users = signal<any[]>([]);
  loading = signal<boolean>(true);
  searchTerm = signal<string>('');

  drawerOpen = signal<boolean>(false);
  selectedUser = signal<any>(null);

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
    private service: UsersService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.buildColumns();
    this.pesquisaUsuarios();
  }

  buildColumns() {
    this.colDefs = [
      { headerName: 'Cód.', field: 'id', maxWidth: 90, flex: 0, filter: 'agNumberColumnFilter', cellClass: 'cell-id' },
      { headerName: 'Nome', field: 'name', minWidth: 180, filter: 'agTextColumnFilter', cellClass: 'cell-strong' },
      { headerName: 'E-mail', field: 'email', minWidth: 220, filter: 'agTextColumnFilter' },
      {
        headerName: 'Tipo',
        field: 'type',
        maxWidth: 150,
        minWidth: 130,
        flex: 0,
        filter: 'agTextColumnFilter',
        valueGetter: (p) => p.data?.type === 'ADMIN' ? 'Administrador' : (p.data?.type === 'USER' ? 'Usuário' : p.data?.type)
      },
      {
        headerName: 'Departamento',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueGetter: (p) => {
          const code = p.data?.department;
          const name = p.data?.departmentUser?.department;
          if (code && name) return `${code} · ${name}`;
          return code || name || '—';
        }
      },
      { headerName: 'Telefone', field: 'telephone', minWidth: 140, filter: 'agTextColumnFilter' },
      {
        headerName: 'Ativo',
        field: 'active',
        maxWidth: 100,
        minWidth: 90,
        flex: 0,
        filter: 'agTextColumnFilter',
        cellRenderer: (p: ICellRendererParams) => {
          const span = document.createElement('span');
          const active = (p.value || '').toString().toUpperCase() === 'S';
          span.className = `status-chip ${active ? 'status-chip--success' : 'status-chip--muted'}`;
          span.innerHTML = `<span class="status-chip__dot"></span>${active ? 'Sim' : 'Não'}`;
          return span;
        }
      },
      {
        headerName: 'Ações',
        maxWidth: 180,
        minWidth: 160,
        flex: 0,
        sortable: false,
        filter: false,
        cellClass: 'cell-actions',
        cellRenderer: (p: ICellRendererParams) => {
          const u = p.data;
          const div = document.createElement('div');
          div.className = 'row-actions';

          const companiesBtn = document.createElement('button');
          companiesBtn.className = 'row-action row-action--primary';
          companiesBtn.title = 'Empresas vinculadas';
          companiesBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">business</span>`;
          companiesBtn.addEventListener('click', (e) => { e.stopPropagation(); this.openLinkageDrawer(u); });
          div.appendChild(companiesBtn);

          const editBtn = document.createElement('button');
          editBtn.className = 'row-action';
          editBtn.title = 'Editar usuário';
          editBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">edit</span>`;
          editBtn.addEventListener('click', (e) => { e.stopPropagation(); this.openEditDialog(u); });
          div.appendChild(editBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'row-action row-action--danger';
          delBtn.title = 'Excluir usuário';
          delBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">delete</span>`;
          delBtn.addEventListener('click', (e) => { e.stopPropagation(); this.delete(u.id, u.type); });
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

  pesquisaUsuarios() {
    this.loading.set(true);
    this.service.getUsuarios().subscribe({
      next: (result) => {
        this.users.set(result || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar usuários', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  openCreateDialog() {
    const formConfig: TabConfig[] = [{
      title: 'Cadastro de Usuário',
      fields: [
        { name: 'name', placeholder: 'Nome completo', type: 'text', required: true },
        { name: 'email', placeholder: 'E-mail', type: 'email', required: true },
        { name: 'password', placeholder: 'Senha', type: 'password', required: true },
        { name: 'telephone', placeholder: 'Telefone', type: 'text', required: true },
        { name: 'department', placeholder: 'Departamento', type: 'select', optionsUrl: 'departments/list', required: true },
        { name: 'type', placeholder: 'Tipo', type: 'select', required: true, options: [
          { id: 'ADMIN', name: 'Administrador' },
          { id: 'USER', name: 'Usuário' }
        ]},
        { name: 'active', placeholder: 'Ativo', type: 'select', required: true, defaultValue: 'S', options: [
          { id: 'S', name: 'Sim' },
          { id: 'N', name: 'Não' }
        ]}
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: 'sessions/create',
        header: { icon: 'person_add', eyebrow: 'Novo usuário', title: 'Cadastro de Usuário', subtitle: 'Preencha os dados do usuário.' },
        submitLabel: 'Cadastrar usuário',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.pesquisaUsuarios());
  }

  openEditDialog(user: any) {
    const formConfig: TabConfig[] = [{
      title: 'Editar Usuário',
      fields: [
        { name: 'id', placeholder: 'Cód.', type: 'number', required: true, visible: true, defaultValue: user.id },
        { name: 'name', placeholder: 'Nome completo', type: 'text', required: true, defaultValue: user.name },
        { name: 'email', placeholder: 'E-mail', type: 'email', required: true, defaultValue: user.email },
        { name: 'password', placeholder: 'Nova senha (deixe em branco para não alterar)', type: 'password', required: false },
        { name: 'telephone', placeholder: 'Telefone', type: 'text', required: true, defaultValue: user.telephone },
        { name: 'department', placeholder: 'Departamento', type: 'select', optionsUrl: 'departments/list', required: true, defaultValue: user.department },
        { name: 'type', placeholder: 'Tipo', type: 'select', required: true, defaultValue: user.type, options: [
          { id: 'ADMIN', name: 'Administrador' },
          { id: 'USER', name: 'Usuário' }
        ]},
        { name: 'active', placeholder: 'Ativo', type: 'select', required: true, defaultValue: user.active, options: [
          { id: 'S', name: 'Sim' },
          { id: 'N', name: 'Não' }
        ]}
      ]
    }];

    // Admins get a second tab for SMTP config. Leaving fields blank disables
    // email sending for that admin — the backend silently skips.
    if (user.type === 'ADMIN') {
      formConfig.push({
        title: 'Configurações de SMTP',
        fields: [
          { name: 'smtpHost', placeholder: 'Servidor SMTP', type: 'text', required: false, defaultValue: user.smtpHost,
            helper: 'Ex: smtp.gmail.com, smtp.office365.com. Deixe em branco para não enviar e-mails.' },
          { name: 'smtpPort', placeholder: 'Porta', type: 'number', required: false, defaultValue: user.smtpPort,
            helper: '587 (STARTTLS) ou 465 (SSL).' },
          { name: 'smtpSecure', placeholder: 'Conexão segura (SSL)', type: 'select', required: false, defaultValue: user.smtpSecure, options: [
            { id: '', name: 'Auto (padrão pela porta)' },
            { id: true, name: 'Sim (SSL — porta 465)' },
            { id: false, name: 'Não (STARTTLS — porta 587)' }
          ]},
          { name: 'smtpUser', placeholder: 'Usuário / E-mail', type: 'text', required: false, defaultValue: user.smtpUser },
          { name: 'smtpPass', placeholder: 'Senha (deixe em branco para manter)', type: 'password', required: false,
            helper: 'A senha é criptografada antes de ser salva.' },
          { name: 'smtpFromEmail', placeholder: 'Remetente (e-mail)', type: 'email', required: false, defaultValue: user.smtpFromEmail,
            helper: 'E-mail que aparecerá no campo "De". Usa o usuário SMTP quando vazio.' },
          { name: 'smtpFromName', placeholder: 'Remetente (nome)', type: 'text', required: false, defaultValue: user.smtpFromName }
        ]
      });
    }

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: `sessions/update/${user.id}`,
        header: { icon: 'person', eyebrow: 'Editar usuário', title: 'Editar Usuário', subtitle: 'Atualize os dados do usuário.' },
        submitLabel: 'Salvar alterações',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.pesquisaUsuarios());
  }

  delete(id: number, type: string) {
    if (type === 'ADMIN') {
      this.snackBar.open('Não é possível excluir um usuário Administrador', 'Fechar', {
        duration: 3000, panelClass: ['snackbar-error']
      });
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.pesquisaUsuarios();
        this.snackBar.open('Usuário excluído', 'Fechar', {
          duration: 2500, panelClass: ['snackbar-success']
        });
      },
      error: (err) => {
        const msg = err?.error?.products?.message || 'Usuário pode conter vínculos com outros processos.';
        this.snackBar.open('Não foi possível excluir: ' + msg, 'Fechar', {
          duration: 3500, panelClass: ['snackbar-error']
        });
      }
    });
  }

  openLinkageDrawer(user: any) {
    this.selectedUser.set(user);
    this.drawerOpen.set(true);
  }

  closeLinkageDrawer() {
    this.drawerOpen.set(false);
  }
}
