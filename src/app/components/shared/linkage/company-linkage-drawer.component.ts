import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DrawerComponent } from '../drawer/drawer.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { ComboboxComponent } from '../combobox/combobox.component';
import { CompaniesService } from '../../companies/companies.service';
import { DepartmetsService } from '../../departments/departmets.service';
import { UsersService } from '../../users/users.service';

type DeptLink = {
  idDepartComp: number;
  departmentId: number;
  companieId: number;
  department?: { id: number; department: string };
  /** Local UI state */
  expanded?: boolean;
  loadingUsers?: boolean;
  users?: Array<{ idDepCompUser: number; userId: number; user: any }>;
  showAddUser?: boolean;
  selectedUserId?: any;
};

@Component({
  selector: 'app-company-linkage-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, DrawerComponent, EmptyStateComponent, SkeletonComponent, ComboboxComponent],
  templateUrl: './company-linkage-drawer.component.html',
  styleUrl: './linkage-drawer.component.css'
})
export class CompanyLinkageDrawerComponent implements OnChanges {
  @Input() open: boolean = false;
  @Input() companyId?: number | string;
  @Input() companyName?: string;
  @Output() closed = new EventEmitter<void>();

  loading = signal<boolean>(false);
  links = signal<DeptLink[]>([]);

  allDepartments = signal<any[]>([]);
  allUsers = signal<any[]>([]);

  showAddDept = signal<boolean>(false);
  selectedDeptId: any = '';

  constructor(
    private companies: CompaniesService,
    private departments: DepartmetsService,
    private usersService: UsersService,
    private snack: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue && this.companyId) this.refresh();
    if (changes['companyId']?.currentValue && this.open) this.refresh();
  }

  /** Departments not yet linked to this company */
  availableDepartments() {
    const linkedIds = new Set(this.links().map(l => Number(l.departmentId)));
    return this.allDepartments().filter(d => !linkedIds.has(Number(d.id)));
  }

  /** Users not yet linked to the given department-link */
  availableUsersFor(link: DeptLink) {
    const linkedIds = new Set((link.users || []).map(u => Number(u.userId)));
    return this.allUsers().filter(u => !linkedIds.has(Number(u.id)));
  }

  refresh() {
    if (!this.companyId) return;
    this.loading.set(true);
    this.companies.getCompaniesDepartment(this.companyId).subscribe({
      next: (result) => {
        this.links.set((result || []) as DeptLink[]);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });

    // Fetch pools (best effort) for the add flows
    this.departments.getDepartments().subscribe(r => this.allDepartments.set(r || []));
    this.usersService.getUsuarios().subscribe(r => this.allUsers.set(r || []));
  }

  close() { this.closed.emit(); }

  toggleExpand(link: DeptLink) {
    link.expanded = !link.expanded;
    if (link.expanded && !link.users) this.loadUsers(link);
  }

  private loadUsers(link: DeptLink) {
    link.loadingUsers = true;
    this.companies.getCompanieDeparmentUser(link.idDepartComp).subscribe({
      next: (result) => {
        link.users = (result || []) as any;
        link.loadingUsers = false;
      },
      error: () => { link.loadingUsers = false; }
    });
  }

  // ── Add / remove department ─────────────────────────────────────────────
  addDepartment() {
    if (!this.selectedDeptId || !this.companyId) return;
    this.companies.createCompanieDeparment({
      companieId: this.companyId,
      departmentId: this.selectedDeptId
    }).subscribe({
      next: () => {
        this.snack.open('Departamento vinculado', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.selectedDeptId = '';
        this.showAddDept.set(false);
        this.refresh();
      },
      error: (err) => {
        const msg = err?.error?.message?.message || 'Erro ao vincular departamento';
        this.snack.open(msg, 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  // ── Add / remove user inside a department ───────────────────────────────
  addUser(link: DeptLink) {
    if (!link.selectedUserId) return;
    this.companies.createCompanieDeparmentUser({
      idDepartComp: link.idDepartComp,
      userId: link.selectedUserId
    }).subscribe({
      next: () => {
        this.snack.open('Usuário vinculado ao departamento', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        link.selectedUserId = '';
        link.showAddUser = false;
        link.users = undefined;
        this.loadUsers(link);
      },
      error: (err) => {
        const msg = err?.error?.message?.message || 'Erro ao vincular usuário';
        this.snack.open(msg, 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  removeUser(link: DeptLink, bind: { idDepCompUser: number }) {
    if (!confirm('Remover este usuário do departamento?')) return;
    this.companies.deleteCompanieDeparmentUser(bind.idDepCompUser).subscribe({
      next: () => {
        this.snack.open('Vínculo removido', 'Fechar', { duration: 2000, panelClass: ['snackbar-success'] });
        link.users = undefined;
        this.loadUsers(link);
      },
      error: () => {
        this.snack.open('Erro ao remover vínculo', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }
}
