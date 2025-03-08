import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormComponent, TabConfig } from '../form/form.component';
import { FORM_CONFIG_CALLED } from './configs_forms/form-new-called';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../core/user/user.service';

@Component({
  selector: 'app-head',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './head.component.html',
  styleUrl: './head.component.css'
})
export class HeadComponent {
  constructor(private dialog: MatDialog,private user: UserService) { }

  @Input() paginaAtiva: string = ''; // Recebe a pagina que esta ativa


  openDynamicForm() {

    const id =  this.user.user.id;

    let formConfig: TabConfig[];

    formConfig = [{
      title: 'Abertura de Chamado',
      fields: [
        { name: 'userId', placeholder: 'Cód. do Usuário', type: 'number' },
        { name: 'status', placeholder: 'Status', type: 'select' , optionsUrl: `situations/list`},
        { name: 'companieIdP', placeholder: 'Cód. Empresa Principal', type: 'select', optionsUrl: `usercompanies/show/${id}`},
        { name: 'companieIdS', placeholder: 'Empresa Abertura', type: 'select', optionsUrl: `usercompanies/show/${id}` },
        { name: 'idDepCall', placeholder: 'Chamado para', type: 'number'},
        { name: 'reason', placeholder: 'Motivo da Abertura', type: 'txtarea' },
        { name: 'file1', placeholder: 'Nf 1', type: 'file' },
        { name: 'file2', placeholder: 'Nf 2', type: 'file' },
        { name: 'file3', placeholder: 'Nf 3', type: 'file', },
        { name: 'file4', placeholder: 'Nf 4', type: 'file', },
        
      ]
    }];

    const dialogRef = this.dialog.open(FormComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw', // Remove a restrição de largura máxima
      panelClass: 'full-screen-dialog', // Classe customizada para o container
      data: {tabs: formConfig, url: 'called'}
    });



    dialogRef.afterClosed().subscribe(result => {
      console.log('Formulário fechado com resultado:', result);
    });
  }


  sair(){
    this.user.logout();
    window.location.reload();
  }

}
