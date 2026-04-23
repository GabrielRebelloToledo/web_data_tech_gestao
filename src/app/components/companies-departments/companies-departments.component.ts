import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CompaniesService } from '../companies/companies.service';
import { FormComponent } from '../form/form.component';
import { UsersCompanieDepsComponent } from '../users-companie-deps/users-companie-deps.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { DepartmetsService } from '../departments/departmets.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-companies-departments',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatTabsModule],
  templateUrl: './companies-departments.component.html',
  styleUrl: './companies-departments.component.css'
})
export class CompaniesDepartmentsComponent implements OnInit {

  form: FormGroup | any;
  codemp: any;
  companiesdep: any[] = [];
  department: any[] = [];

  loading: boolean = false;
  table: boolean = true;
  editMode: boolean = false;

  constructor(private snackBar: MatSnackBar, private fb: FormBuilder, private dialogRef: MatDialogRef<CompaniesDepartmentsComponent>, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private serviceCompanies: CompaniesService, private departmentService: DepartmetsService) {

  }
  ngOnInit(): void {
    this.codemp = this.data
    this.pesquisaEmpresasDepartamentos();
    this.pesquisaDepartamento();

    this.form = this.fb.group({
      idDepartComp: [''],
      companieId: [''],
      departmentId: ['', [Validators.required]]
    });

  }


  pesquisaEmpresasDepartamentos() {
    this.serviceCompanies.getCompaniesDepartment(this.codemp).subscribe(result => {
      this.companiesdep = result;
    });
  }

  pesquisaDepartamento() {
    this.loading = true;
    this.departmentService.getDepartments().subscribe(result => {
      this.department = result;
    });
    this.loading = false;
  }

  verDepartametos() {
    this.table = true;
  }

  verFormulario() {
    this.table = false;

    this.form.patchValue({
      companieId: this.codemp
    });
  }


  vincularDepartamento() {

    this.table = false;

    /* this.form.patchValue({
      companieId: this.codemp
    }); */

    if (this.form.invalid) return;


    if (this.editMode) {

      /* this.serviceCompanies.update(this.form.value).subscribe({
        next: () => {
          this.pesquisaEmpresasDepartamentos();
          this.snackBar.open('Departamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erro ao inserir', err.error.message.message);
          alert('Não foi possível inserir. Tente novamente.' + err.error.message.message);
        }
      }); */


    } else {

      this.serviceCompanies.createCompanieDeparment(this.form.value).subscribe({
        next: () => {
          this.pesquisaEmpresasDepartamentos();
          this.snackBar.open('Departamento adicionado com sucesso!', 'Fechar', {
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


  }


  vincularusuario(arg0: any) {

    const dialogRef = this.dialog.open(UsersCompanieDepsComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      data: { codunicdep: arg0 }
    });


  }


  fechar() {
    this.dialogRef.close();
  }
}
