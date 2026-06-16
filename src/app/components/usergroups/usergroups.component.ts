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
import { UsergroupsService } from './usergroups.service';
import {
  UsergroupFormDialogComponent,
  UserGroupDialogData,
  UserGroupDialogResult,
  UserGroupUser
} from './usergroup-form-dialog.component';
import { ThemeService } from '../core/theme/theme.service';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { AG_GRID_LOCALE_PT_BR } from '../calleds/calleds.locale';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-usergroups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    AgGridAngular,
    EmptyStateComponent,
    SkeletonComponent
  ],
  templateUrl: './usergroups.component.html',
  styleUrl: './usergroups.component.css'
})
export class UsergroupsComponent implements OnInit {

  groups = signal<any[]>([]);
  users = signal<UserGroupUser[]>([]);
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
    private usergroupsService: UsergroupsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.buildColumns();
    this.loadUsers();
    this.loadGroups();
  }

  buildColumns(): void {
    this.colDefs = [
      { headerName: 'Cód.', field: 'id', maxWidth: 100, flex: 0, filter: 'agNumberColumnFilter', cellClass: 'cell-id' },
      { headerName: 'Nome', field: 'name', minWidth: 240, filter: 'agTextColumnFilter', cellClass: 'cell-strong' },
      {
        headerName: 'Membros',
        maxWidth: 130,
        minWidth: 110,
        flex: 0,
        filter: 'agNumberColumnFilter',
        valueGetter: (p: ValueGetterParams) => p.data?.members?.length || 0
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
          editBtn.title = 'Editar grupo';
          editBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">edit</span>`;
          editBtn.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); this.openEdit(p.data); });
          div.appendChild(editBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'row-action row-action--danger';
          delBtn.title = 'Excluir grupo';
          delBtn.innerHTML = `<span class="material-symbols-rounded icon-sm">delete</span>`;
          delBtn.addEventListener('click', (e: MouseEvent) => { e.stopPropagation(); this.delete(id); });
          div.appendChild(delBtn);

          return div;
        }
      }
    ];
  }

  onGridReady(e: GridReadyEvent): void { this.gridApi = e.api; }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  loadUsers(): void {
    this.usergroupsService.getUsers().subscribe({
      next: (result: any[]) => this.users.set((result || []) as UserGroupUser[]),
      error: () => {
        this.snackBar.open('Não foi possível carregar os usuários', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  loadGroups(): void {
    this.loading.set(true);
    this.usergroupsService.getList().subscribe({
      next: (result: any[]) => {
        this.groups.set(result || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Não foi possível carregar os grupos de usuários', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
      }
    });
  }

  openCreate(): void {
    const data: UserGroupDialogData = {
      mode: 'create',
      users: this.users()
    };

    this.dialog.open(UsergroupFormDialogComponent, {
      width: 'min(620px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data
    }).afterClosed().subscribe((payload: UserGroupDialogResult | null) => {
      if (!payload) return;
      this.usergroupsService.create(payload).subscribe({
        next: () => {
          this.loadGroups();
          this.snackBar.open('Grupo criado', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        },
        error: () => {
          this.snackBar.open('Não foi possível criar o grupo', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
        }
      });
    });
  }

  openEdit(group: any): void {
    const data: UserGroupDialogData = {
      mode: 'edit',
      group,
      users: this.users()
    };

    this.dialog.open(UsergroupFormDialogComponent, {
      width: 'min(620px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data
    }).afterClosed().subscribe((payload: UserGroupDialogResult | null) => {
      if (!payload) return;
      this.usergroupsService.update(group.id, payload).subscribe({
        next: () => {
          this.loadGroups();
          this.snackBar.open('Grupo atualizado', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        },
        error: () => {
          this.snackBar.open('Não foi possível atualizar o grupo', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
        }
      });
    });
  }

  delete(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este grupo de usuários?')) return;
    this.usergroupsService.delete(id).subscribe({
      next: () => {
        this.loadGroups();
        this.snackBar.open('Grupo excluído', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
      },
      error: () => {
        this.snackBar.open('Não foi possível excluir o grupo', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }
}
