import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    this.loadStatuses();
  }

  loadCalled() {
    if (!this.id) { this.errorMessage = 'ID do chamado não encontrado'; this.loadingCalled = false; return; }
    this.loadingCalled = true;
    this.calledsService.getCall(this.id).subscribe({
      next: (result: any) => {
        this.called = result;
        // Anyone authenticated can capture an unassigned ticket
        this.canCapture = !this.called?.userIdResp;
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

  back() {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/inicio']);
  }

  authorName(entry: any): string {
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
