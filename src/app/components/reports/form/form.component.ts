import { Component, OnInit } from '@angular/core';
import { ShellComponent } from '../../shell/shell.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsDetailsComponent } from "../forms-details/forms-details.component";
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ReportServiceService } from '../report-service.service';
import { LoadingComponent } from "../../loading/loading/loading.component";
import { MensageErrorComponent } from "../../loading/mensage-error/mensage-error.component";
import { MensageOkComponent } from "../../loading/mensage-ok/mensage-ok.component";

import { ActivatedRoute, Router } from '@angular/router';
import { ReportCab } from './reportcab';
import { ReportFiles } from './reportFiles';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ConfirmDialogService } from '../../confirm-dialog/confirm-dialog.service';
import { FormFieldConfig, TabConfig } from '../../form/form.component';
import { MatDialog } from '@angular/material/dialog';

import { FormComponent as formPrefs } from '../../form/form.component';

interface UploadedFile {
  fileName: string;
  filePath: string; // Pode ser a URL ou caminho retornado pela API
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ShellComponent, FormsModule, CommonModule, ReactiveFormsModule, MatTabsModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, LoadingComponent, MensageErrorComponent, MensageOkComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})


export class FormComponent implements OnInit {

  //Arquivos
  uploadProgress = -1;
  uploadedFiles: { [key: string]: string } = {};

  form: FormGroup | any;
  formRelatorio: FormGroup | any;

  spinner: boolean = true;
  ok: boolean = false;
  erro: boolean = false;
  mensagemErro: string = "Erro ao salvar. Tente novamente mais tarde.";
  mensagemCarregamento: string = "Enviando dados...";

  id: number | null = null;
  isUpdate = false;

  listReportCab: ReportCab[] = [];
  listReportFiles: ReportFiles[] = [];

  abrirParametro: boolean = false;




  constructor(private dialog: MatDialog, private confirmDialog: ConfirmDialogService, private fb: FormBuilder, private service: ReportServiceService, private router: Router, private route: ActivatedRoute) {

    this.form = this.fb.group({
      id: [''],
      nome: ['', Validators.required],
      type: ['', [Validators.required]],
    });
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');

      if (idParam) {
        this.id = +idParam;
        this.isUpdate = true;
        this.carregarRelatorio(this.id);
        this.pesquisaReportsFiles();
      } else {
        this.isUpdate = false;
        // lógica de novo cadastro
      }
    });
  }


  carregarRelatorio(id: any) {


    this.service.getReportShow(id).subscribe({
      next: (response) => {
        console.log(response)
        this.form.patchValue({
          id: response.id,     // ou response['id']
          nome: response.nome,
          type: response.type
        });

      },
      error: (err) => {
        console.log(err)
      }
    })

  }


  pesquisaReportsFiles() {
    this.service.getReportShowDetails(this.id).subscribe(result => {
      this.listReportFiles = result;
      console.log(result)
    });
  }


  onSubmit() {


    if (this.isUpdate) {

      /*  if (this.form.invalid) return; */
      this.service.update(this.form.value).subscribe({
        next: (response) => {

          if (response.status === 200) {
            this.spinner = false;
            this.ok = true;

            // Fecha automático após 5 segundos
            setTimeout(() => {
              this.fecharOverlay();
              window.location.reload();
            }, 5000);

          } else {
            this.spinner = false;
            this.erro = true;

            // Fecha automático após 5 segundos
            setTimeout(() => {
              this.fecharOverlay();
              window.location.reload();
            }, 5000);


          }

        },
        error: (err) => {

          console.error('Erro ao inserir', err.error.message.message);
          this.spinner = false;
          this.erro = true;
          setTimeout(() => {
            this.fecharOverlay();
            window.location.reload();
          }, 5000);
        }
      });

    } else {
      if (this.form.invalid) return;
      this.service.create(this.form.value).subscribe({
        next: (response) => {

          console.log(response);
          console.log('Status HTTP:', response.status);

          if (response.status === 200) {
            this.spinner = false;
            this.ok = true;

            // Fecha automático após 5 segundos
            setTimeout(() => this.fecharOverlay(), 2000);

            const newID = response.body['id'];

            console.log(newID)

            this.router.navigate(['/cabreport', newID]);


          } else {
            this.spinner = false;
            this.erro = true;

            // Fecha automático após 5 segundos
            setTimeout(() => this.fecharOverlay(), 5000);
          }

        },
        error: (err) => {

          console.error('Erro ao inserir', err.error.message.message);
          this.spinner = false;
          this.erro = true;
          setTimeout(() => this.fecharOverlay(), 5000);

        }
      });

    }

  }

  onTabChange(event: MatTabChangeEvent) {
    console.log(event); // Veja no console os detalhes do evento

    switch (event.index) {
      case 0:

        break;
      case 1:

        break;
      case 2:

      break;

    }
  }

  fecharOverlay() {
    this.spinner = true;
    this.ok = false;
    this.erro = false;
  }



  listaSelecionados: number[] = [];
  listaSelecionadosNome: string[] = [];
  onCheckboxSelectChange(event: Event, dados: any) {

    const checked = (event.target as HTMLInputElement).checked;

    const id = dados.id;
    const nome = dados.arquivo;


    if (checked) {
      // Adiciona se marcado e ainda não está na lista
      if (!this.listaSelecionados.includes(dados)) {
        this.listaSelecionados.push(dados);
        this.listaSelecionadosNome.push(nome);
      }
    } else {
      // Remove se desmarcado
      const index = this.listaSelecionados.indexOf(dados);
      const indexNome = this.listaSelecionadosNome.indexOf(nome);

      if (index !== -1) {
        this.listaSelecionados.splice(index, 1);
        console.log("Desmarquei e removi da lista");
      }
      if (indexNome !== -1) {
        this.listaSelecionadosNome.splice(indexNome, 1);
        console.log("Desmarquei e removi da lista");
      }
    }

    console.log(this.listaSelecionados)
    console.log(this.listaSelecionadosNome)

  }


  onCheckboxChange(event: Event, dados: any) {
    const checked = (event.target as HTMLInputElement).checked;
    dados.mestre = checked ? 1 : 0;

    this.service.updateFile(dados).subscribe({
      next: (response) => {

        console.log(response);
        console.log('Status HTTP:', response.status);

        if (response.status === 200) {

          this.spinner = false;
          //this.ok = true;

          // Fecha automático após 5 segundos
          setTimeout(() => { this.fecharOverlay(), this.pesquisaReportsFiles(); }, 1000);


        } else {
          this.spinner = false;
          this.erro = true;

          // Fecha automático após 5 segundos
          setTimeout(() => this.fecharOverlay(), 5000);
        }

      },
      error: (err) => {

        console.error('Erro ao inserir', err.error.message);
        this.spinner = false;
        this.erro = true;
        this.mensagemErro = err.error.message;

        setTimeout(() => { this.fecharOverlay(), this.pesquisaReportsFiles() }, 5000);

      }
    });
  }


  //Arquivos


  triggerFileInput(fieldName: string) {
    const inputElement = document.getElementById('file-input-update') as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  }

  onFileSelected(event: Event, fieldName: string) {

    if (this.id == null) {
      this.erro = true;
      this.mensagemErro = "Formulário Principal não Criado!"
      setTimeout(() => { this.fecharOverlay(), this.pesquisaReportsFiles() }, 3000);
      return;
    }

    console.log("cheguei aqui!" + fieldName)
    const input = event.target as HTMLInputElement;

    console.log(input.files)

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.service.uploadFile(file, this.id).subscribe({
        next: (event: HttpEvent<any>) => {
          this.spinner = false;

          if (event.type === HttpEventType.UploadProgress) {
            if (event.total !== undefined) {  // Verifica se event.total não é undefined
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
              console.log('% concluído:', this.uploadProgress);
            }
          } else if (event.type === HttpEventType.Response) {
            console.log('Upload concluído:', event.body.path.filename);
            this.spinner = true;
            this.uploadedFiles[fieldName] = event.body.path.filename;
            this.pesquisaReportsFiles();
          }
        },

        error: (error) => {
          console.error('Erro no upload', error);
        },
        complete: () => {
          console.log('Upload finalizado.');
        }
      });
    }
  }


  async onDeleteFile() {

    const confirmado = await this.confirmDialog.confirmar("Deseja excluir os Arquivos Selecionados ?");
    if (!confirmado) return;

    if (this.listaSelecionados.length == 0) {
      this.chamarErro("Não Existem Arquivos Selecionados!");
    }

    if (this.listaSelecionados.length > 0) {
      this.service.deleteFiles(this.listaSelecionados).subscribe({
        next: (response) => {

          console.log('Arquivo(s) excluído', response);
          this.pesquisaReportsFiles();

        },
        error: (error) => {
          console.error('Erro ao excluir o arquivo', error);
        }
      });
    }
  }



  onDownloadFile() {

    if (this.listaSelecionadosNome.length == 0) {
      this.chamarErro("Não Existem Arquivos Selecionados!");
    }

    const agora = new Date();
    const dataFormatada = agora.toISOString()
      .replace(/[:.]/g, '-') // substitui caracteres inválidos em nomes de arquivo
      .replace('T', '_')      // substitui o T por underline
      .slice(0, 16);          // corta para "YYYY-MM-DD_HH-MM"

    if (this.listaSelecionadosNome.length > 0) {
      this.service.downloadFile(this.listaSelecionadosNome, this.id).subscribe({
        next: (file: Blob) => {
          const url = window.URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = url;
          a.download = `relatorios_${dataFormatada}.zip`;
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


  visualizar() {

    console.log("Entrei aqui")
    console.log(this.id)
    if (!this.id) return;

    this.service.paramsReport(this.id).subscribe({
      next: (res) => {

        console.log(res)

        if (res.length > 0) {
          this.openDynamicForm(res);
        }

      },
      error: (error: any) => {
        console.error('Erro ao baixar o arquivo:', error);
      },
    })
    /* const valor = this.form.get('nome')?.value;
    const formato = this.form.get('type')?.value;
    const formatoLow = formato.toLowerCase();
    if (this.listaSelecionadosNome.length > 0) {
      this.service.downloadFile(this.listaSelecionadosNome, this.id).subscribe({
        next: (file: Blob) => {
          const url = window.URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${valor}.${formatoLow}`;
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
    } */
  }


  chamarErro(motivo: any) {
    this.erro = true;
    this.mensagemErro = motivo;
    setTimeout(() => { this.fecharOverlay(), this.pesquisaReportsFiles() }, 5000);
  }



  //fields: {} | any;


  fields: {
    name: string;
    placeholder: string;
    type: 'text' | 'email' | 'password' | 'select' | 'number' | 'check' | 'file' | 'date' | 'txtarea';
    required: boolean;
    visible?: boolean;
  }[] = [];

  openDynamicForm(campos_recebidos: any) {

    this.abrirParametro = true;

    const parametros: any[] = campos_recebidos; // vindo da API

    this.fields = parametros
      .filter(param => param.exibir === 'true')
      .map(param => {
        let tipoCampo: any['type'] = 'text'; // valor padrão válido

        switch (param.tipo) {
          case 'Integer':
          case 'Long':
          case 'Double':
          case 'BigDecimal':
          case 'Float':
          case 'Number':
            tipoCampo = 'number';
            break;

          case 'Boolean':
            tipoCampo = 'check'; // check em vez de checkbox ✅
            break;

          case 'Date':
          case 'Time':
          case 'Timestamp':
            tipoCampo = 'date'; // use apenas 'date' para compatibilidade ✅
            break;

          case 'String':
          default:
            tipoCampo = 'text';
            break;
        }

        return {
          name: param.nome,
          placeholder: param.descricao,
          type: tipoCampo,
          required: param.obrigatorio === 'true',
          visible: true // opcional, mas útil se for controlar visibilidade depois
        };
      });

    const controls: { [key: string]: any } = {};
    this.fields.forEach(field => {
      controls[field.name] = field.required ? ['', Validators.required] : [''];
    });

    this.formRelatorio = this.fb.group(controls);

    console.log(this.formRelatorio.value)

  }


  gerarRelatorio() {

    this.mensagemCarregamento = "Gerando Relatório..."
    this.spinner = false;

    const data = new Date();

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
    const ano = data.getFullYear();

    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    const segundo = String(data.getSeconds()).padStart(2, '0');

    const dataFormatada = `${dia}${mes}${ano}${hora}${minuto}${segundo}`



    const valor = this.form.get('nome')?.value;
    const formato = this.form.get('type')?.value;
    const formatoLow = formato.toLowerCase();

    this.service.gerarReport(this.id, this.formRelatorio.value).subscribe({
      next: (file: Blob) => {
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${valor}-${dataFormatada}.${formatoLow}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.spinner = true;
      },
      error: (error: any) => {
        console.error('Erro ao baixar o arquivo:', error);
      },
      complete: () => {
        console.log('Download concluído.');
        this.spinner = true;
      }
    });

  }

  fecharPopupParametros() {

    this.abrirParametro = false;
  }
}


