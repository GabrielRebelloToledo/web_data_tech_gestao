import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { User } from '../core/user/user';
import { LService } from './service';
import { UserService } from '../core/user/user.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;
  erroLogin = false;
  erroMessage: string = '';
  spinner = false;
  showPassword = false;
  year = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private service: LService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.erroLogin = true;
      this.erroMessage = 'Preencha e-mail e senha para continuar.';
      return;
    }

    this.spinner = true;
    this.erroLogin = false;
    this.erroMessage = '';

    const login = this.loginForm.getRawValue() as User;
    this.service.login(login).subscribe({
      next: (success: any) => {
        const authToken = success.token;
        this.userService.setToken(authToken);
        this.router.navigate(['inicio']);
        this.spinner = false;
      },
      error: (error: any) => {
        this.spinner = false;
        this.erroLogin = true;
        this.erroMessage = error?.error?.message?.appErrorType || 'Não foi possível autenticar. Tente novamente.';
      }
    });
  }
}
