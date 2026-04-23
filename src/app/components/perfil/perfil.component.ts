import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { UserService } from '../core/user/user.service';
import { UsersService } from '../users/users.service';
import { User } from '../core/user/user';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {

  isReadonly: boolean = true;

  @Input() id!: number;
  @Output() loadingFinished = new EventEmitter<boolean>();
  isLoading = false;

  displayedColumns: string[] = ['id', 'name', 'email', 'grupo', 'active', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  dataForm: FormGroup;
  editMode = false;
  selectedUserId: number | null = null;

  roles = [
    { value: 'S', viewValue: 'Sim' },
    { value: 'N', viewValue: 'Não' },
  ];

  rolesGroup = [
    { value: 'ADMIN', viewValue: 'Administrador' },
    { value: 'USER', viewValue: 'Usuário' },
  ];

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private service: UsersService, private user: UserService,) {
    this.dataForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      type: ['', [Validators.required]],
      active: ['', [Validators.required]]
    });
  }
  ngOnInit(): void {
    this.pesquisaUsuário();
  }

  saveStatus() {
    if (this.dataForm.invalid) return;


    this.service.update(this.dataForm.value).subscribe({
      next: () => {
        this.pesquisaUsuário();
        this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
        this.clearForm();
      },
      error: (err) => {
        console.error('Erro ao inserir', err.error.message.message);
        alert('Não foi possível inserir. Tente novamente.' + err.error.message.message);
      }
    });


  }

  edit(user: User) {
    this.dataForm.setValue({ id: user.id, name: user.name, email: user.email, password: '', type: user.type, active: user.active });
    this.selectedUserId = user.id;
    this.editMode = true;
  }


  clearForm() {
    this.dataForm.reset();
    this.editMode = false;
    this.selectedUserId = null;
  }

  pesquisaUsuário() {
    this.isLoading = true;

    const idUser = this.user.user.id;
    this.service.getUser(idUser).subscribe({
      next: (result: User) => {
        this.dataForm.patchValue({
          id: result.id,
          name: result.name,
          email: result.email,
          password: '',
          type: result.type,
          active: result.active
        });
        this.isLoading = false; // Finaliza o carregamento
        this.loadingFinished.emit(true);  // Emite o evento para informar que o carregamento terminou
      },
      error: (err) => {
        console.error('Erro ao buscar usuário:', err);
      }
    });
  }




}
