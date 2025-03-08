import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CompaniesService } from '../companies/companies.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-companie-deps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-companie-deps.component.html',
  styleUrl: './users-companie-deps.component.css'
})
export class UsersCompanieDepsComponent implements OnInit{


  codemp: any;
  coddep:any;

  dialogRefe:any;
  
  companiesdepUser: any[] = [];
  
    constructor(private dialogRef: MatDialogRef<UsersCompanieDepsComponent>, private dialog2: MatDialog, @Inject(MAT_DIALOG_DATA) public data: {codemp:any, coddep:any}, private serviceCompanies: CompaniesService) {
  
    }
    ngOnInit(): void {
      this.codemp = this.data?.codemp
      this.coddep = this.data?.coddep
      this.pesquisaEmpresasDepartamentosUsuarios();
    }
    
  
    pesquisaEmpresasDepartamentosUsuarios() {
      this.serviceCompanies.getCompaniesDepartmentUser(this.codemp, this.coddep).subscribe(result => {
        this.companiesdepUser = result;
      });
    }
  


    fechar(){
      this.dialogRef.close();
    }

}
