import { Component, AfterViewInit } from '@angular/core';
import { HeadComponent } from "../head/head.component";
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CalledsService } from '../calleds/calleds.service';
import { FormService } from '../form/form.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-called-view',
  standalone: true,
  imports: [HeadComponent, CommonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './called-view.component.html',
  styleUrl: './called-view.component.css'
})
export class CalledViewComponent implements AfterViewInit {
  uploadedFiles: { [key: string]: string } = {};
  idchamado: string | null = null;
  called: any = null;
  errorMessage: string = '';

  isLoading:boolean =  true;

  constructor(private route: ActivatedRoute, private serviceCalled: CalledsService, private service: FormService) { }



  ngAfterViewInit() {
    this.idchamado = this.route.snapshot.paramMap.get('id');
    console.log(this.idchamado);

    this.buscarChamado();
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

  onDownloadFile(fieldName: string) {
    const uploadedFile = this.uploadedFiles[fieldName];
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


  close(){
    window.close();
  }
}
