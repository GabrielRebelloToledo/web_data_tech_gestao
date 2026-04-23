import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompaniesDepartmentsComponent } from '../companies-departments/companies-departments.component';
import { CompaniesService } from '../companies/companies.service';
import { DepartmetsService } from '../departments/departmets.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { UserCompaniesService } from './user-companies.service';

@Component({
  selector: 'app-user-companies',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatTabsModule],
  templateUrl: './user-companies.component.html',
  styleUrl: './user-companies.component.css'
})
export class UserCompaniesComponent implements OnInit {

  form: FormGroup | any;
  codusu: any;
  companiesdep: any[] = [];
  usercomp: any[] = [];

  loading: boolean = false;
  table: boolean = true;
  editMode: boolean = false;

  constructor(private userserv: UserCompaniesService, private snackBar: MatSnackBar, private fb: FormBuilder, private dialogRef: MatDialogRef<CompaniesDepartmentsComponent>, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private serviceCompanies: CompaniesService, private departmentService: DepartmetsService) {

  }
  ngOnInit(): void {
    this.codusu = this.data
    this.pesquisaEmpresas();
    this.pesquisaEmpresasCadastradas();

    this.form = this.fb.group({
      idUserCompanie: [''],
      userId: ['', [Validators.required]],
      companieId: ['', [Validators.required]]
    });

  }


  pesquisaEmpresas() {
    this.serviceCompanies.getCompanies().subscribe(result => {
      this.companiesdep = result;
    });
  }

  pesquisaEmpresasCadastradas() {
    this.loading = true;
    this.userserv.getUserCompanies(this.codusu).subscribe(result => {
      this.usercomp = result;
     /*  console.log(result) */
    });
    this.loading = false;
  }

  verDepartametos() {
    this.table = true;
  }

  verFormulario() {
    this.table = false;

    this.form.patchValue({
      userId: this.codusu
    });
  }



  vincularDepartamento() {

    this.table = false;

    /* this.form.patchValue({
      companieId: this.codemp
    }); */

    if (this.form.invalid) return;

    this.userserv.createUserCompanie(this.form.value).subscribe({
      next: () => {
        this.pesquisaEmpresasCadastradas();
        this.snackBar.open('Empresa adicionada com sucesso!', 'Fechar', {
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


  fechar() {
    this.dialogRef.close();
  }

  deleteUser(id: any) {

    if (confirm('Tem certeza que deseja excluir esta Empresa do Usuário?')) {
      this.userserv.delete(this.codusu, id).subscribe({
        next: () => {
          this.pesquisaEmpresasCadastradas();
          console.log('Empresa excluída do vinculo com sucesso.');
        },
        error: (err) => {
          console.error('Erro ao excluir Empresa:', err);
          alert('Não foi possível excluir o Empresa. Tente novamente.');
        }
      });
    }

  }
}
