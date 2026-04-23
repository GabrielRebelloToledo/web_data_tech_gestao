import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CompaniesService } from '../companies/companies.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmetsService } from '../departments/departmets.service';

@Component({
  selector: 'app-users-companie-deps',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatTabsModule],
  templateUrl: './users-companie-deps.component.html',
  styleUrl: './users-companie-deps.component.css'
})
export class UsersCompanieDepsComponent implements OnInit {

  form: FormGroup | any;

  codunicdep: any;
  dialogRefe: any;

  companiesdepUser: any[] = [];
  users: any[] = [];
  department: any[] = [];

  loading: boolean = false;
  table: boolean = true;
  editMode: boolean = false;


  constructor(private snackBar: MatSnackBar, private fb: FormBuilder, private dialogRef: MatDialogRef<UsersCompanieDepsComponent>, private dialog2: MatDialog, @Inject(MAT_DIALOG_DATA) public data: { codunicdep: any }, private serviceCompanies: CompaniesService, private departmentService: DepartmetsService) {

  }
  ngOnInit(): void {
    this.codunicdep = this.data?.codunicdep

   /*  console.log(this.codunicdep) */

    this.pesquisaEmpresasDepartamentosUsuarios();


    this.form = this.fb.group({
      idDepCompUser: [''],
      idDepartComp: [''],
      userId: ['', [Validators.required]]
    });



  }


  pesquisaEmpresasDepartamentosUsuarios() {
    this.serviceCompanies.getCompanieDeparmentUser(this.codunicdep).subscribe(result => {
      this.companiesdepUser = result;
    });
  }



  fechar() {
    this.dialogRef.close();
  }


  verUsuarios() {
    this.table = true;
  }

  vincularUsuarios() {

    this.table = true;

    this.serviceCompanies.createCompanieDeparmentUser(this.form.value).subscribe({
      next: () => {
        this.pesquisaEmpresasDepartamentosUsuarios();
        this.snackBar.open('Usuário adicionado com sucesso ao Departamento!', 'Fechar', {
          duration: 3000, horizontalPosition: 'start',
          verticalPosition: 'top',
        });
        this.table = true;
      },
      error: (err) => {
        console.error('Erro ao inserir', err.error.message.message);
        alert('Não foi possível inserir. Tente novamente.' + err.error.message.message);
      }
    });

  }


  verFormulario() {
    this.table = false;
    this.pesquisaUsuarios();


    this.form.patchValue({
      idDepartComp: this.codunicdep
    });


  }


  pesquisaUsuarios() {
    this.serviceCompanies.getUsers().subscribe(result => {
      this.users = result;
   /*    console.log(this.users) */
    });
  }


  pesquisaDepartamento() {
    this.loading = true;
    this.departmentService.getDepartments().subscribe(result => {
      this.department = result;
    });
    this.loading = false;
  }


  delete(id: any) {

    this.loading = true;
    this.serviceCompanies.deleteCompanieDeparmentUser(id).subscribe({
      next: () => {
        this.pesquisaEmpresasDepartamentosUsuarios();
        this.snackBar.open('Usuário excluído com sucesso do Departamento!', 'Fechar', {
          duration: 3000, horizontalPosition: 'start',
          verticalPosition: 'top',
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao inserir', err.error.message.message);
        alert('Não foi possível excluir. Tente novamente.' + err.error.message.message);
      }
    });
  }
}
