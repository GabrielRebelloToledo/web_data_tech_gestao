import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { environment } from '../../../environments/environment';

import { ShellComponent } from '../shell/shell.component';
import { EmptyStateComponent } from '../shared/empty-state/empty-state.component';
import { StatusChipComponent } from '../shared/status-chip/status-chip.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

import { CalledsService } from '../calleds/calleds.service';
import { CalledDetailsService } from '../called-details/called-details.service';
import { FormService } from '../form/form.service';
import { UserService } from '../core/user/user.service';

type StatusOption = { id: number; status: string };

@Component({
  selector: 'app-called-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ShellComponent,
    EmptyStateComponent,
    StatusChipComponent,
    SkeletonComponent
  ],
  templateUrl: './called-detail.component.html',
  styleUrl: './called-detail.component.css'
})
export class CalledDetailComponent implements OnInit {
  id!: string | null;
  called: any = null;
  history: any[] = [];
  attachments: any[] = [];
  apiBase = environment.BASE_URL;
  statusOptions: StatusOption[] = [];

  loadingCalled = true;
  loadingHistory = true;
  errorMessage = '';

  commentForm!: FormGroup;
  commentAttachments: { [key: string]: string } = {};
  uploadProgress: { [key: string]: number } = {};
  submittingComment = false;
  canCapture = false;
  currentUserId: number;
  currentUserType: string;

  // Transferência
  showTransfer = false;
  loadingOperators = false;
  transferOperators: any[] = [];
  transferTarget: any = '';
  transferring = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private calledsService: CalledsService,
    private detailService: CalledDetailsService,
    private formService: FormService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.currentUserId = this.userService.user?.id;
    this.currentUserType = (this.userService.user as any)?.type || '';
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.commentForm = this.fb.group({
      calledId: [this.id, Validators.required],
      userId: [this.currentUserId, Validators.required],
      status: ['', Validators.required],
      detail: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.loadCalled();
    this.loadHistory();
    this.loadAttachments();
    this.loadStatuses();
  }

  loadAttachments() {
    if (!this.id) return;
    this.calledsService.getAttachments(this.id).subscribe({
      next: (data: any[]) => { this.attachments = data || []; },
      error: () => { this.attachments = []; }
    });
  }

  loadCalled() {
    if (!this.id) { this.errorMessage = 'ID do chamado não encontrado'; this.loadingCalled = false; return; }
    this.loadingCalled = true;
    this.calledsService.getCall(this.id).subscribe({
      next: (result: any) => {
        this.called = result;
        // Anyone authenticated can capture an unassigned ticket
        this.canCapture = !this.called?.userIdResp && !this.isLocked();
        this.configureFormForRole();
        this.loadingCalled = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os detalhes do chamado.';
        this.loadingCalled = false;
      }
    });
  }

  isAssignedToMe(): boolean {
    return !!this.called?.userIdResp && Number(this.called.userIdResp) === Number(this.currentUserId);
  }

  // ── Papéis e estado do workflow ──────────────────────────────────────
  isAdmin(): boolean {
    return (this.currentUserType || '').toUpperCase() === 'ADMIN';
  }

  isRequester(): boolean {
    return !!this.called && Number(this.called.userId) === Number(this.currentUserId);
  }

  // Operador = responsável atribuído, ou ADMIN que não seja o próprio solicitante.
  isOperator(): boolean {
    return this.isAssignedToMe() || (this.isAdmin() && !this.isRequester());
  }

  // Chamado fechado (close = 'S') => travado, ninguém altera.
  isLocked(): boolean {
    const st = this.called?.statusId;
    if (st?.close) return st.close === 'S';
    return /conclu/i.test(st?.status || '');
  }

  isFinalizadoOperador(): boolean {
    return /finalizado pelo operador/i.test(this.called?.statusId?.status || '');
  }

  // Quem pode postar atualização: operador (sempre, se não travado) ou
  // solicitante (sempre, se não travado — vira "Respondido pelo Usuário").
  canComment(): boolean {
    return !this.isLocked() && (this.isOperator() || this.isRequester());
  }

  // Só o operador escolhe status no dropdown.
  canSetStatus(): boolean {
    return this.isOperator() && !this.isLocked();
  }

  // Solicitante avalia quando o operador finalizou.
  canEvaluate(): boolean {
    return this.isRequester() && !this.isOperator() && this.isFinalizadoOperador() && !this.isLocked();
  }

  canTransfer(): boolean {
    return (this.isAssignedToMe() || this.isAdmin()) && !this.isLocked();
  }

  // Ajusta validação do form conforme o papel (solicitante não envia status).
  private configureFormForRole() {
    const statusCtrl = this.commentForm.get('status');
    if (!statusCtrl) return;
    if (this.canSetStatus()) {
      statusCtrl.setValidators([Validators.required]);
    } else {
      statusCtrl.clearValidators();
      statusCtrl.setValue('');
    }
    statusCtrl.updateValueAndValidity();
  }

  // Solicitante aprova o chamado finalizado => Concluído.
  approve() {
    if (!this.id || this.submittingComment) return;
    this.submittingComment = true;
    const payload: any = {
      calledId: this.id,
      action: 'approve',
      detail: (this.commentForm.value.detail || '').trim() || 'Chamado avaliado e aprovado pelo solicitante.'
    };
    this.formService.create(payload, 'called/create').subscribe({
      next: () => {
        this.submittingComment = false;
        this.snackBar.open('Chamado avaliado e concluído. Obrigado!', 'Fechar', { duration: 3000, panelClass: ['snackbar-success'] });
        this.loadHistory();
        this.loadAttachments();
        this.loadCalled();
      },
      error: (err) => {
        this.submittingComment = false;
        const msg = err?.error?.message?.message || 'Não foi possível concluir o chamado';
        this.snackBar.open(msg, 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });
  }

  toggleTransfer() {
    this.showTransfer = !this.showTransfer;
    if (this.showTransfer && !this.transferOperators.length) {
      this.loadingOperators = true;
      this.calledsService.getTransferOperators(this.id).subscribe({
        next: (ops: any[]) => {
          // Não oferecer o responsável atual como alvo.
          this.transferOperators = (ops || []).filter(o => Number(o.id) !== Number(this.called?.userIdResp));
          this.loadingOperators = false;
        },
        error: () => { this.loadingOperators = false; }
      });
    }
  }

  doTransfer() {
    if (!this.id || !this.transferTarget || this.transferring) return;
    this.transferring = true;
    this.calledsService.transferCall(this.id, this.transferTarget).subscribe({
      next: () => {
        this.transferring = false;
        this.showTransfer = false;
        this.transferTarget = '';
        this.transferOperators = [];
        this.snackBar.open('Chamado transferido', 'Fechar', { duration: 2500, panelClass: ['snackbar-success'] });
        this.loadHistory();
        this.loadCalled();
      },
      error: (err) => {
        this.transferring = false;
        const msg = err?.error?.message?.message || 'Não foi possível transferir o chamado';
        this.snackBar.open(msg, 'Fechar', { duration: 3500, panelClass: ['snackbar-error'] });
      }
    });
  }

  loadHistory() {
    if (!this.id) return;
    this.loadingHistory = true;
    this.detailService.getCall(this.id).subscribe({
      next: (data: any[]) => {
        this.history = (data || [])
          .filter(e => e && (e.detail?.toString().trim() || e.file1 || e.file2 || e.file3 || e.file4))
          .sort((a, b) =>
            new Date(a.dataResponse || 0).getTime() - new Date(b.dataResponse || 0).getTime()
          );
        this.loadingHistory = false;
      },
      error: () => { this.loadingHistory = false; }
    });
  }

  loadStatuses() {
    this.formService.getSelect('status/list').subscribe({
      next: (data: any[]) => { this.statusOptions = data as StatusOption[]; },
      error: () => {}
    });
  }

  capture() {
    if (!this.id) return;
    this.calledsService.getRespCall(this.currentUserId, this.id).subscribe({
      next: () => {
        this.snackBar.open('Chamado capturado com sucesso', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-success']
        });
        this.loadCalled();
      },
      error: () => {
        this.snackBar.open('Não foi possível capturar o chamado', 'Fechar', {
          duration: 3500, panelClass: ['snackbar-error']
        });
      }
    });
  }

  triggerAttachment(slot: string) {
    const el = document.getElementById('attach-' + slot) as HTMLInputElement | null;
    el?.click();
  }

  onAttachmentSelected(event: Event, slot: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    this.uploadProgress[slot] = 0;
    this.formService.uploadFile(file).subscribe({
      next: (e: HttpEvent<any>) => {
        if (e.type === HttpEventType.UploadProgress && e.total) {
          this.uploadProgress[slot] = Math.round(100 * e.loaded / e.total);
        } else if (e.type === HttpEventType.Response) {
          this.commentAttachments[slot] = e.body.path.filename;
          this.uploadProgress[slot] = 100;
        }
      },
      error: () => {
        this.snackBar.open('Falha ao enviar anexo', 'Fechar', {
          duration: 3000, panelClass: ['snackbar-error']
        });
        delete this.uploadProgress[slot];
      }
    });
  }

  removeAttachment(slot: string) {
    const file = this.commentAttachments[slot];
    if (!file) { delete this.uploadProgress[slot]; return; }
    this.formService.deleteFile(file).subscribe({
      next: () => {
        delete this.commentAttachments[slot];
        delete this.uploadProgress[slot];
      },
      error: () => {}
    });
  }

  attachmentSlots = ['file1', 'file2', 'file3', 'file4'];

  submitComment() {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    this.submittingComment = true;
    const payload: any = {
      ...this.commentForm.value,
      ...this.commentAttachments
    };

    this.formService.create(payload, 'called/create').subscribe({
      next: () => {
        this.submittingComment = false;
        this.commentForm.reset({
          calledId: this.id,
          userId: this.currentUserId,
          status: '',
          detail: ''
        });
        this.commentAttachments = {};
        this.uploadProgress = {};
        this.snackBar.open('Atualização registrada', 'Fechar', {
          duration: 2500, panelClass: ['snackbar-success']
        });
        this.loadHistory();
        this.loadAttachments();
        this.loadCalled();
      },
      error: (err) => {
        this.submittingComment = false;
        const msg = err?.error?.message?.message || 'Não foi possível registrar o comentário';
        this.snackBar.open(msg, 'Fechar', {
          duration: 3500, panelClass: ['snackbar-error']
        });
      }
    });
  }

  downloadFile(name: string) {
    if (!name) return;
    this.formService.downloadFile(name).subscribe({
      next: (file: Blob) => {
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  openPrint(fileName: string) {
    if (!fileName) return;
    window.open(this.apiBase + 'upload/show/' + fileName, '_blank');
  }

  back() {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/inicio']);
  }

  authorName(entry: any): string {
    if (entry?.authorType === 'AI') return 'Assistente IA';
    return entry?.userResp?.name || entry?.user?.name || 'Sistema';
  }

  statusLabel(entry: any): string {
    const nested = entry?.statusId?.status;
    if (nested) return nested;
    const raw = entry?.status;
    if (typeof raw === 'string') return raw;
    const match = this.statusOptions.find(s => Number(s.id) === Number(raw));
    return match?.status || '';
  }

  getFiles(entry: any): string[] {
    return ['file1', 'file2', 'file3', 'file4'].map(k => entry?.[k]).filter(Boolean);
  }

  getAttachedFiles(called: any): string[] {
    if (!called) return [];
    return ['file1', 'file2', 'file3', 'file4'].map(k => called?.[k]).filter(Boolean);
  }

  breadcrumbs() {
    return [
      { label: 'Início', route: '/inicio' },
      { label: `Chamado #${this.called?.id || this.id || ''}` }
    ];
  }
}
