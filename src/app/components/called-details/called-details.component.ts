import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { CalledsService } from '../calleds/calleds.service';
import { HeadComponent } from "../head/head.component";
import { CalledDetailsService } from './called-details.service';
import { CalledDetails } from './call-details';
import { FormService } from '../form/form.service';
import { MatIconModule } from '@angular/material/icon';
import { FormComponent, TabConfig } from '../form/form.component';
import { MatDialog } from '@angular/material/dialog';
 
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-called-details',
  standalone: true,
  imports: [MatTabsModule, CommonModule, HeadComponent, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './called-details.component.html',
  styleUrl: './called-details.component.css'
})
export class CalledDetailsComponent implements OnInit {
  idchamado: string | null = null;
  called: any = { user: {}, statusId: {}, primaryCompanie: {} };
  errorMessage: string = '';
  calledsDetails: CalledDetails[] = [];
  isLoading:boolean =  true;


  constructor(private dialog: MatDialog, private route: ActivatedRoute, private serviceCalled: CalledsService, private serviceDetailCalled: CalledDetailsService, private service: FormService) {

  }
  ngOnInit(): void {
    this.buscarChamado();
    this.idchamado = this.route.snapshot.paramMap.get('id');
  }
  onTabChange(event: MatTabChangeEvent) {
    console.log(event); // Veja no console os detalhes do evento

    switch (event.index) {
      case 0:
        this.buscarChamado();
        break;
      case 1:
        this.buscarHistoria();
        break;
      case 2:

        break;

    }
  }


  buscarChamado() {
    this.idchamado = this.route.snapshot.paramMap.get('id');

    if (!this.idchamado) {
      this.errorMessage = 'ID do chamado não encontrado!';
      return;
    }

    this.serviceCalled.getCall(this.idchamado).subscribe({
      next: (result) => {
        this.called = result;
        console.log(this.called);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar chamado:', error);
        this.errorMessage = 'Erro ao carregar os detalhes do chamado.';
        this.isLoading = false;
      }
    });

  }

  buscarHistoria() {
    this.called = [];
    this.idchamado = this.route.snapshot.paramMap.get('id');

    if (!this.idchamado) {
      this.errorMessage = 'ID do chamado não encontrado!';
      return;
    }

    this.serviceDetailCalled.getCall(this.idchamado).subscribe({
      next: (data: CalledDetails[]) => {
        console.log('🔍 Chamados carregados:', data);
        this.calledsDetails = data;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar chamados:', err);
      }
    });
  }


  onDownloadFile(fieldName: string) {
    const uploadedFile = fieldName
    console.log(uploadedFile);
    if (uploadedFile) {
      this.service.downloadFile(uploadedFile).subscribe({
        next: (file: Blob) => {
          const url = window.URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = url;
          a.download = uploadedFile + "" || 'arquivo'; // Usa o nome do arquivo ou um nome padrão
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.error('Erro ao baixar o arquivo:', error);
        },
        complete: () => {
          console.log('Download concluído.');
        }
      });
    }
  }


  openDynamicForm() {
    this.idchamado = this.route.snapshot.paramMap.get('id');

    let formConfig: TabConfig[];

    formConfig = [{
      title: 'Retorno de Chamado',
      fields: [
        { name: 'calledId', placeholder: 'Cód. do Chamado', type: 'number' },
        { name: 'status', placeholder: 'Status', type: 'text'},
        { name: 'detail', placeholder: 'Descritivo', type: 'txtarea'},
        { name: 'file1', placeholder: 'Arquivo 1', type: 'file'},
        { name: 'file2', placeholder: 'Arquivo 2', type: 'file'},
        { name: 'file3', placeholder: 'Arquivo 3', type: 'file'},
        { name: 'file4', placeholder: 'Arquivo 4', type: 'file'}
      ]
    }];

    const dialogRef = this.dialog.open(FormComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw', // Remove a restrição de largura máxima
      panelClass: 'full-screen-dialog', // Classe customizada para o container
      data: { tabs: formConfig, url: 'called/create', callId: this.idchamado }
    });



    dialogRef.afterClosed().subscribe(result => {
      console.log('Formulário fechado com resultado:', result);
    });
  }


}


