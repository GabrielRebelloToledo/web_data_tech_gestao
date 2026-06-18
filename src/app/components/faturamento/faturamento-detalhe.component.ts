import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShellComponent } from '../shell/shell.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { StatusChipComponent } from '../shared/status-chip/status-chip.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { BillingService } from './billing.service';

@Component({
  selector: 'app-faturamento-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    ShellComponent,
    EmptyStateComponent,
    StatusChipComponent,
    SkeletonComponent
  ],
  templateUrl: './faturamento-detalhe.component.html',
  styleUrl: './faturamento-detalhe.component.css'
})
export class FaturamentoDetalheComponent implements OnInit {
  id!: string | null;
  faturamento: any = null;
  loading = true;
  errorMessage = '';
  paying = false;
  estornando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billing: BillingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.load();
  }

  load() {
    if (!this.id) { this.errorMessage = 'ID do faturamento não encontrado'; this.loading = false; return; }
    this.loading = true;
    this.billing.showFaturamento(this.id).subscribe({
      next: (result: any) => {
        this.faturamento = result;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar o faturamento.';
        this.loading = false;
      }
    });
  }

  get apontamentos(): any[] {
    return this.faturamento?.apontamentos || [];
  }

  get isOpen(): boolean {
    return this.faturamento?.status === 'ABERTO';
  }

  num(value: any): number {
    return Number(value) || 0;
  }

  totalHours(): number {
    return this.apontamentos.reduce((sum: number, a: any) => sum + (Number(a.hours) || 0), 0);
  }

  print() {
    window.print();
  }

  pay() {
    if (!this.id || this.paying || !this.isOpen) return;
    this.paying = true;
    this.billing.pay(this.id).subscribe({
      next: () => {
        this.paying = false;
        this.snackBar.open('Faturamento marcado como pago', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.load();
      },
      error: (err) => {
        this.paying = false;
        const msg = err?.error?.message?.message || 'Não foi possível baixar o faturamento';
        this.snackBar.open(msg, 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });
  }

  estornar() {
    if (!this.id || this.estornando || !this.isOpen) return;
    if (!confirm('Estornar este faturamento? Os apontamentos voltarão para o status ABERTO.')) return;
    this.estornando = true;
    this.billing.estornar(this.id).subscribe({
      next: () => {
        this.estornando = false;
        this.snackBar.open('Faturamento estornado', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.router.navigate(['/faturamento']);
      },
      error: (err) => {
        this.estornando = false;
        const msg = err?.error?.message?.message || 'Não foi possível estornar o faturamento';
        this.snackBar.open(msg, 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });
  }

  back() {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/faturamento']);
  }

  breadcrumbs() {
    return [
      { label: 'Faturamento', route: '/faturamento' },
      { label: `Faturamento #${this.faturamento?.id || this.id || ''}` }
    ];
  }
}
