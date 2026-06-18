import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShellComponent } from '../shell/shell.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { StatusChipComponent } from '../shared/status-chip/status-chip.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { ComboboxComponent } from '../shared/combobox/combobox.component';

import { ProjetosService } from './projetos.service';
import { FormComponent, TabConfig } from '../form/form.component';

const PROJECT_STATUS_OPTIONS = [
  { id: 'ATIVO', name: 'Ativo' },
  { id: 'PAUSADO', name: 'Pausado' },
  { id: 'CONCLUIDO', name: 'Concluído' }
];

const TASK_STATUS_OPTIONS = [
  { id: 'PENDENTE', name: 'Pendente' },
  { id: 'EM_ANDAMENTO', name: 'Em andamento' },
  { id: 'CONCLUIDO', name: 'Concluído' }
];

@Component({
  selector: 'app-projeto-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShellComponent,
    EmptyStateComponent,
    StatusChipComponent,
    SkeletonComponent,
    ComboboxComponent
  ],
  templateUrl: './projeto-detalhe.component.html',
  styleUrl: './projeto-detalhe.component.css'
})
export class ProjetoDetalheComponent implements OnInit {
  id!: string | null;
  project: any = null;
  loading = true;
  errorMessage = '';

  // Vincular chamado
  showLink = false;
  loadingCalleds = false;
  availableCalleds: any[] = [];
  linkOptions: { id: number; name: string }[] = [];
  linkTarget: any = null;
  linking = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projetosService: ProjetosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadProject();
  }

  loadProject() {
    if (!this.id) { this.errorMessage = 'ID do projeto não encontrado'; this.loading = false; return; }
    this.loading = true;
    this.projetosService.show(this.id).subscribe({
      next: (result: any) => {
        this.project = result;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os detalhes do projeto.';
        this.loading = false;
      }
    });
  }

  // ── Helpers de apresentação ──────────────────────────────────────────
  projectStatusLabel(status: string): string {
    return PROJECT_STATUS_OPTIONS.find(o => o.id === status)?.name || status || '—';
  }

  taskStatusLabel(status: string): string {
    return TASK_STATUS_OPTIONS.find(o => o.id === status)?.name || status || '—';
  }

  formatDate(value: any): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  }

  period(start: any, end: any): string {
    const s = this.formatDate(start);
    const e = this.formatDate(end);
    if (s === '—' && e === '—') return '—';
    return `${s} – ${e}`;
  }

  private toInputDate(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }

  clampProgress(value: any): number {
    const n = Number(value);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  get calleds(): any[] {
    return this.project?.calleds || [];
  }

  get tasks(): any[] {
    return [...(this.project?.tasks || [])].sort(
      (a: any, b: any) => (Number(a?.orderIndex) || 0) - (Number(b?.orderIndex) || 0)
    );
  }

  // ── Chamados vinculados ──────────────────────────────────────────────
  toggleLink() {
    this.showLink = !this.showLink;
    this.linkTarget = null;
    if (this.showLink && !this.availableCalleds.length) {
      this.loadingCalleds = true;
      this.projetosService.listCalleds().subscribe({
        next: (data: any[]) => {
          this.availableCalleds = data || [];
          this.linkOptions = this.availableCalleds.map((c: any) => ({
            id: c.id,
            name: `#${c.id} · ${c.reason || 'Sem motivo'}`
          }));
          this.loadingCalleds = false;
        },
        error: () => { this.loadingCalleds = false; }
      });
    }
  }

  linkCalled() {
    if (!this.id || this.linkTarget == null || this.linking) return;
    this.linking = true;
    this.projetosService.addCalled(this.id, this.linkTarget).subscribe({
      next: () => {
        this.linking = false;
        this.showLink = false;
        this.linkTarget = null;
        this.snackBar.open('Chamado vinculado', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.loadProject();
      },
      error: (err) => {
        this.linking = false;
        const msg = err?.error?.message?.message || 'Não foi possível vincular o chamado';
        this.snackBar.open(msg, 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });
  }

  removeCalled(projectCalledId: number) {
    if (!confirm('Remover este chamado do projeto?')) return;
    this.projetosService.removeCalled(projectCalledId).subscribe({
      next: () => {
        this.snackBar.open('Vínculo removido', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.loadProject();
      },
      error: () => {
        this.snackBar.open('Não foi possível remover o vínculo', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  // ── Cronograma / tarefas ─────────────────────────────────────────────
  openNewTask() {
    if (!this.id) return;
    const formConfig: TabConfig[] = [{
      title: 'Nova Tarefa',
      fields: [
        { name: 'title', placeholder: 'Título', type: 'text', required: true },
        { name: 'description', placeholder: 'Descrição', type: 'txtarea', required: false },
        { name: 'responsibleUserId', placeholder: 'Responsável', type: 'select', required: false, optionsUrl: 'sessions/list', labelKey: 'name' },
        { name: 'startDate', placeholder: 'Início', type: 'date', required: false },
        { name: 'dueDate', placeholder: 'Prazo', type: 'date', required: false },
        { name: 'status', placeholder: 'Status', type: 'select', required: true, defaultValue: 'PENDENTE', options: TASK_STATUS_OPTIONS },
        { name: 'progress', placeholder: 'Progresso (%)', type: 'number', required: false, defaultValue: 0 },
        { name: 'orderIndex', placeholder: 'Ordem', type: 'number', required: false, defaultValue: this.tasks.length }
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: `projects/${this.id}/task`,
        callId: '',
        skipReload: true,
        header: { icon: 'task', eyebrow: 'Nova tarefa', title: 'Nova Tarefa', subtitle: 'Adicione uma tarefa ao cronograma do projeto.' },
        submitLabel: 'Adicionar tarefa',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.loadProject());
  }

  openEditTask(task: any) {
    const formConfig: TabConfig[] = [{
      title: 'Editar Tarefa',
      fields: [
        { name: 'id', placeholder: 'Cód.', type: 'number', required: true, visible: true, defaultValue: task.id },
        { name: 'title', placeholder: 'Título', type: 'text', required: true, defaultValue: task.title },
        { name: 'description', placeholder: 'Descrição', type: 'txtarea', required: false, defaultValue: task.description },
        { name: 'responsibleUserId', placeholder: 'Responsável', type: 'select', required: false, optionsUrl: 'sessions/list', labelKey: 'name', defaultValue: task.responsibleUserId },
        { name: 'startDate', placeholder: 'Início', type: 'date', required: false, defaultValue: this.toInputDate(task.startDate) },
        { name: 'dueDate', placeholder: 'Prazo', type: 'date', required: false, defaultValue: this.toInputDate(task.dueDate) },
        { name: 'status', placeholder: 'Status', type: 'select', required: true, defaultValue: task.status || 'PENDENTE', options: TASK_STATUS_OPTIONS },
        { name: 'progress', placeholder: 'Progresso (%)', type: 'number', required: false, defaultValue: task.progress ?? 0 },
        { name: 'orderIndex', placeholder: 'Ordem', type: 'number', required: false, defaultValue: task.orderIndex ?? 0 }
      ]
    }];

    this.dialog.open(FormComponent, {
      width: 'min(760px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '92vh',
      panelClass: 'shell-dialog',
      data: {
        tabs: formConfig,
        url: `projects/task/${task.id}`,
        callId: '',
        skipReload: true,
        header: { icon: 'task', eyebrow: 'Editar tarefa', title: 'Editar Tarefa', subtitle: 'Atualize os dados da tarefa.' },
        submitLabel: 'Salvar alterações',
        submitIcon: 'check'
      }
    }).afterClosed().subscribe(() => this.loadProject());
  }

  deleteTask(taskId: number) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    this.projetosService.deleteTask(taskId).subscribe({
      next: () => {
        this.snackBar.open('Tarefa excluída', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.loadProject();
      },
      error: () => {
        this.snackBar.open('Não foi possível excluir a tarefa', 'Fechar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  back() {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/projetos']);
  }

  breadcrumbs() {
    return [
      { label: 'Projetos', route: '/projetos' },
      { label: this.project?.name || `Projeto #${this.id || ''}` }
    ];
  }
}
