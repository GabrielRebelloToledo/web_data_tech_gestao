import { Component, OnInit } from '@angular/core';
import { HeadComponent } from "../head/head.component";
import { CommonModule } from '@angular/common';
import { DepartmetsService } from './departmets.service';
import { FormComponent, TabConfig } from '../form/form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [HeadComponent, CommonModule],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.css'
})
export class DepartmentsComponent implements OnInit {



  constructor(private serviceDepartments: DepartmetsService, private dialog: MatDialog) {

  }
  ngOnInit(): void {

    this.pesquisaDepartamentos();

  }

  departments: any[] = [];



  pesquisaDepartamentos() {
    this.serviceDepartments.getDepartments().subscribe(result => {
      this.departments = result;
    });
  }



  openDynamicForm() {

    let formConfig: TabConfig[];

    formConfig = [{
      title: 'Criação de Departamento',
      fields: [
        { name: 'department', placeholder: 'Nome do Departamento', type: 'text' },
      ]
    }];

    const dialogRef = this.dialog.open(FormComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw', // Remove a restrição de largura máxima
      panelClass: 'full-screen-dialog', // Classe customizada para o container
      data: { tabs: formConfig, url: 'departments', callId: '' }
    });



    dialogRef.afterClosed().subscribe(result => {
      console.log('Formulário fechado com resultado:', result);
    });
  }


  deleteDepartment(id: number): void {
    if (confirm('Tem certeza que deseja excluir este departamento?')) {
      this.serviceDepartments.delete(id).subscribe({
        next: () => {
          this.pesquisaDepartamentos();
          console.log('Departamento excluído com sucesso.');
        },
        error: (err) => {
          console.error('Erro ao excluir departamento:', err);
          alert('Não foi possível excluir o departamento. Tente novamente.');
        }
      });
    }
  }
  

}
