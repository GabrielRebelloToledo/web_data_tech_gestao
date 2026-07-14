import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ShellComponent } from '../shell/shell.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { UserService } from '../core/user/user.service';
import { PlatformSmtpService } from './platform-smtp.service';

@Component({
  selector: 'app-platform-smtp',
  standalone: true,
  imports: [CommonModule, FormsModule, ShellComponent, SkeletonComponent],
  templateUrl: './platform-smtp.component.html',
  styleUrl: './platform-smtp.component.css'
})
export class PlatformSmtpComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  testing = signal(false);

  hasPass = signal(false);

  model = {
    smtpHost: '',
    smtpPort: null as number | null,
    smtpSecure: '' as '' | boolean,
    smtpUser: '',
    smtpPass: '',
    smtpFromEmail: '',
    smtpFromName: '',
  };

  constructor(
    private service: PlatformSmtpService,
    private snack: MatSnackBar,
    private user: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Guarda de acesso no cliente — só super admin. O backend também barra.
    if (!(this.user.user as any)?.isSuperAdmin) {
      this.router.navigate(['/inicio']);
      return;
    }
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.get().subscribe({
      next: (s) => {
        this.model.smtpHost = s.smtpHost || '';
        this.model.smtpPort = s.smtpPort ?? null;
        this.model.smtpSecure = s.smtpSecure == null ? '' : s.smtpSecure;
        this.model.smtpUser = s.smtpUser || '';
        this.model.smtpFromEmail = s.smtpFromEmail || '';
        this.model.smtpFromName = s.smtpFromName || '';
        this.hasPass.set(!!s.hasPass);
        this.loading.set(false);
      },
      error: () => {
        this.snack.open('Não foi possível carregar a configuração de SMTP.', 'Fechar', { duration: 5000 });
        this.loading.set(false);
      }
    });
  }

  private payload() {
    const p: any = {
      smtpHost: this.model.smtpHost?.trim() || '',
      smtpPort: this.model.smtpPort,
      smtpSecure: this.model.smtpSecure,
      smtpUser: this.model.smtpUser?.trim() || '',
      smtpFromEmail: this.model.smtpFromEmail?.trim() || '',
      smtpFromName: this.model.smtpFromName?.trim() || '',
    };
    // Senha só vai quando digitada — em branco mantém a atual.
    if (this.model.smtpPass && this.model.smtpPass.trim()) p.smtpPass = this.model.smtpPass;
    return p;
  }

  save() {
    this.saving.set(true);
    this.service.update(this.payload()).subscribe({
      next: (s) => {
        this.hasPass.set(!!s.hasPass);
        this.model.smtpPass = '';
        this.saving.set(false);
        this.snack.open('SMTP da plataforma salvo.', 'Fechar', { duration: 4000 });
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Erro ao salvar o SMTP.', 'Fechar', { duration: 5000 });
      }
    });
  }

  // Salva e valida as credenciais (o teste usa a config gravada).
  saveAndTest() {
    this.saving.set(true);
    this.service.update(this.payload()).subscribe({
      next: (s) => {
        this.hasPass.set(!!s.hasPass);
        this.model.smtpPass = '';
        this.saving.set(false);
        this.runTest();
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Erro ao salvar antes de testar.', 'Fechar', { duration: 5000 });
      }
    });
  }

  private runTest() {
    this.testing.set(true);
    this.service.test().subscribe({
      next: (r) => {
        this.testing.set(false);
        if (r.ok) this.snack.open('Conexão SMTP OK — credenciais válidas.', 'Fechar', { duration: 5000 });
        else this.snack.open(`Falha na conexão: ${r.error || 'verifique os dados'}.`, 'Fechar', { duration: 7000 });
      },
      error: () => {
        this.testing.set(false);
        this.snack.open('Não foi possível testar a conexão.', 'Fechar', { duration: 5000 });
      }
    });
  }
}
