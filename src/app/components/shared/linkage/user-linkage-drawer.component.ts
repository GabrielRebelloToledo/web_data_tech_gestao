import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DrawerComponent } from '../drawer/drawer.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { ComboboxComponent } from '../combobox/combobox.component';
import { CompaniesService } from '../../companies/companies.service';
import { UserCompaniesService } from '../../user-companies/user-companies.service';

@Component({
  selector: 'app-user-linkage-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, DrawerComponent, EmptyStateComponent, SkeletonComponent, ComboboxComponent],
  templateUrl: './user-linkage-drawer.component.html',
  styleUrl: './linkage-drawer.component.css'
})
export class UserLinkageDrawerComponent implements OnChanges {
  @Input() open: boolean = false;
  @Input() userId?: number | string;
  @Input() userName?: string;
  @Output() closed = new EventEmitter<void>();

  loading = signal<boolean>(false);
  linkedCompanies = signal<any[]>([]);
  allCompanies = signal<any[]>([]);

  showAdd = signal<boolean>(false);
  selectedCompanyId: any = '';

  constructor(
    private userCompanies: UserCompaniesService,
    private companies: CompaniesService,
    private snack: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue && this.userId) this.refresh();
    if (changes['userId']?.currentValue && this.open) this.refresh();
  }

  availableCompanies() {
    const linkedIds = new Set(this.linkedCompanies().map(c => Number(c.id)));
    return this.allCompanies().filter(c => !linkedIds.has(Number(c.id)));
  }

  refresh() {
    if (!this.userId) return;
    this.loading.set(true);
    this.userCompanies.getUserCompanies(this.userId).subscribe({
      next: (result) => {
        this.linkedCompanies.set(result || []);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
    this.companies.getCompanies().subscribe(r => this.allCompanies.set(r || []));
  }

  close() { this.closed.emit(); }

  add() {
    if (!this.selectedCompanyId || !this.userId) return;
    this.userCompanies.createUserCompanie({
      userId: this.userId,
      companieId: this.selectedCompanyId
    }).subscribe({
      next: () => {
        this.snack.open('Empresa vinculada', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.selectedCompanyId = '';
        this.showAdd.set(false);
        this.refresh();
      },
      error: (err) => {
        const msg = err?.error?.message?.message || 'Erro ao vincular empresa';
        this.snack.open(msg, 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  remove(company: any) {
    if (!confirm(`Remover vínculo com ${company.name}?`)) return;
    this.userCompanies.delete(this.userId, company.id).subscribe({
      next: () => {
        this.snack.open('Vínculo removido', 'Fechar', { duration: 2000, panelClass: ['snackbar-success'] });
        this.refresh();
      },
      error: () => {
        this.snack.open('Erro ao remover vínculo', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }
}
