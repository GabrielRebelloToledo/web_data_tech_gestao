import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LService } from '../login/service';

@Component({
  selector: 'app-first-access',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './first-access.component.html',
  styleUrl: './first-access.component.css'
})
export class FirstAccessComponent {
  // 1 = informar e-mail · 2 = código + nova senha · 3 = sucesso
  step = signal<1 | 2 | 3>(1);
  spinner = signal(false);
  erro = signal('');
  showPassword = signal(false);
  year = new Date().getFullYear();

  emailForm!: FormGroup;
  resetForm!: FormGroup;
  private email = '';

  constructor(
    private fb: FormBuilder,
    private service: LService,
    private router: Router
  ) {}

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]]
    });
  }

  // Passo 1 → solicita o código.
  requestCode() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      this.erro.set('Informe um e-mail válido.');
      return;
    }
    this.spinner.set(true);
    this.erro.set('');
    this.email = this.emailForm.getRawValue().email.trim();

    this.service.requestFirstAccess(this.email).subscribe({
      next: () => {
        this.spinner.set(false);
        this.step.set(2);
      },
      error: () => {
        // Resposta é genérica por design; avança mesmo assim.
        this.spinner.set(false);
        this.step.set(2);
      }
    });
  }

  // Passo 2 → valida código + define senha.
  confirm() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.erro.set('Preencha o código de 6 dígitos e a nova senha.');
      return;
    }
    const { code, password, confirm } = this.resetForm.getRawValue();
    if (password !== confirm) {
      this.erro.set('As senhas não conferem.');
      return;
    }

    this.spinner.set(true);
    this.erro.set('');
    this.service.confirmFirstAccess({ email: this.email, code: String(code).trim(), password }).subscribe({
      next: () => {
        this.spinner.set(false);
        this.step.set(3);
        // Redireciona ao login automaticamente após alguns segundos.
        setTimeout(() => this.router.navigate(['']), 4000);
      },
      error: (err) => {
        this.spinner.set(false);
        this.erro.set(err?.error?.message?.message || 'Não foi possível concluir. Tente novamente.');
      }
    });
  }

  resendCode() {
    this.step.set(1);
    this.erro.set('');
    this.resetForm.reset();
  }

  goToLogin() {
    this.router.navigate(['']);
  }
}
