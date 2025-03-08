import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Node } from './node.model';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent, TabConfig } from '../../form/form.component';
import { RECEBIMENTO_NF_FORM_CONFIG } from './configs_forms/form-config-recebimento-nf';
import { MatTooltipModule } from '@angular/material/tooltip';



@Component({
  selector: 'app-node',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './node.component.html',
  styleUrl: './node.component.css'
})




export class NodeComponent {
  @Input() node!: Node;

  constructor(private dialog: MatDialog) { }

  openDynamicForm(node: any) {

    let formConfig: TabConfig[];

    switch (node.label) {


      case "Recebimento de NF":

      formConfig = RECEBIMENTO_NF_FORM_CONFIG;
      break;

      default:
      // Define um valor padrão, pode ser um formulário vazio ou um fallback
      formConfig = []; 
      break;

    } 

    const dialogRef = this.dialog.open(FormComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw', // Remove a restrição de largura máxima
      panelClass: 'full-screen-dialog', // Classe customizada para o container
      data: formConfig
    });



    dialogRef.afterClosed().subscribe(result => {
      console.log('Formulário fechado com resultado:', result);
    });
  }
}
