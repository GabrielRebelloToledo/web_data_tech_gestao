import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { User } from '../core/user/user';
import { LService } from './service';
import { UserService } from '../core/user/user.service';
import { Router } from '@angular/router';





@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


  loginForm?: FormGroup | any;


  constructor(
    private formBuilder: FormBuilder,  
    private service : LService, 
    private userService: UserService, 
    private router: Router) { }


  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

          login() {

              this.loginForm = this.formBuilder.group({
                email: this.loginForm.get('email')!.value,
                password: this.loginForm.get('password')!.value,
              });

              const login = this.loginForm.getRawValue() as User;        
              this.service.login(login).subscribe({
                next: (success: any) => {
                  console.log()

                  const authToken = success.token;
                  this.userService.setToken(authToken);
                  this.router.navigate(['inicio']);
                  
                },
                error: (error: any) => {
                  console.log(error)
                }
              })
            }
      /* "email":"gabrielreb7211221@gmail.com",
      "password":"123456789", */

}
