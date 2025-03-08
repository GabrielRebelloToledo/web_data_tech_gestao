import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CompaniesService } from '../companies/companies.service';
import { FormComponent } from '../form/form.component';
import { UsersCompanieDepsComponent } from '../users-companie-deps/users-companie-deps.component';

@Component({
  selector: 'app-companies-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companies-departments.component.html',
  styleUrl: './companies-departments.component.css'
})
export class CompaniesDepartmentsComponent implements OnInit {

  codemp: any;

  companiesdep: any[] = [];

  constructor(private dialogRef: MatDialogRef<CompaniesDepartmentsComponent>, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, private serviceCompanies: CompaniesService) {

  }
  ngOnInit(): void {
    this.codemp = this.data
    this.pesquisaEmpresasDepartamentos();
  }


  pesquisaEmpresasDepartamentos() {
    this.serviceCompanies.getCompaniesDepartment(this.codemp).subscribe(result => {
      this.companiesdep = result;
    });
  }


  vincularusuario(arg0: any, arg1: any) {

    const dialogRef = this.dialog.open(UsersCompanieDepsComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      data: {codemp: arg1,coddep: arg0}
    });

    
  }


  fechar(){
    this.dialogRef.close();
  }
}
