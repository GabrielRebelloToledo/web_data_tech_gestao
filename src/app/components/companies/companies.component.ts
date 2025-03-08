import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeadComponent } from "../head/head.component";
import { CompaniesService } from './companies.service';
import { FormComponent, TabConfig } from '../form/form.component';
import { MatDialog } from '@angular/material/dialog';
import { CompaniesDepartmentsComponent } from '../companies-departments/companies-departments.component';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, HeadComponent],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css'
})
export class CompaniesComponent implements OnInit {


  companies: any[] = [];

  constructor(private serviceCompanies: CompaniesService, private dialog: MatDialog) {

  }


  ngOnInit(): void {
    this.pesquisaEmpresas();
  }


  pesquisaEmpresas() {
    this.serviceCompanies.getCompanies().subscribe(result => {
      this.companies = result;
    });
  }


  openDynamicForm() {

    let formConfig: TabConfig[];

    formConfig = [{
      title: 'Criação de Empresa',
      fields: [
        { name: 'name', placeholder: 'Nome da Empresa', type: 'text' },
        { name: 'cnpj', placeholder: 'CNPJ', type: 'text' },
        { name: 'adress', placeholder: 'Endereço Completo', type: 'text' },
        { name: 'email', placeholder: 'Email', type: 'text' },
        { name: 'telephone', placeholder: 'Telefone', type: 'text' },

      ]
    }];

    const dialogRef = this.dialog.open(FormComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw', // Remove a restrição de largura máxima
      panelClass: 'full-screen-dialog', // Classe customizada para o container
      data: { tabs: formConfig, url: 'companies', callId: '' }
    });



    dialogRef.afterClosed().subscribe(result => {
      console.log('Formulário fechado com resultado:', result);
    });
  }


  deleteCompanie(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta Empresa?')) {
      this.serviceCompanies.delete(id).subscribe({
        next: () => {
          this.pesquisaEmpresas();
          console.log('Empresa excluído com sucesso.');
        },
        error: (err) => {
          console.error('Erro ao excluir Empresa:', err);
          alert('Não foi possível excluir o Empresa. Tente novamente.');
        }
      });
    }
  }


  cadastroDepartamentos(arg0: any) {
    const dialogRef = this.dialog.open(CompaniesDepartmentsComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw', // Remove a restrição de largura máxima
      panelClass: 'full-screen-dialog',
      data:arg0
    });
  }



}
