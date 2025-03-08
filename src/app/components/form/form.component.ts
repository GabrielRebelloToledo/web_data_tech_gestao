import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';
import { FormService } from './form.service';
import { UserService } from '../core/user/user.service';


export interface FormFieldConfig {
  name: string;
  placeholder: string;
  type: 'text' | 'email' | 'password' | 'select' | 'number' | 'check' | 'file' | 'date' | 'txtarea';
  route?: string;
  optionsUrl?: string;
  visible?: boolean
}

export interface TabConfig {
  title: string;
  fields: FormFieldConfig[];
  columns?: number;
}

export interface URL {
  url: string
}

interface UploadedFile {
  fileName: string;
  filePath: string; // Pode ser a URL ou caminho retornado pela API
}

const API = environment.BASE_URL;

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatTabsModule,],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {


  // Objeto para armazenar os uploads. A chave será o nome do campo.
  uploadedFiles: { [key: string]: string } = {};



  uploadProgress = -1;

  @Input() tabs: TabConfig[] = [];
  @Input() url: any;
  @Input() callId: any;
  form: FormGroup | any;
  options: { [key: string]: any[] } = {};
  columns: number | any;

  constructor(private user: UserService, private fb: FormBuilder, private router: Router, private http: HttpClient, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: { tabs: TabConfig[], url: string, callId: string }, private service: FormService) { }


  ngOnInit() {


    const id = this.user.user.id;
    const email = this.user.user.email;
    const companieId = this.user.user.companieId;
    const department = this.user.user.department;


    console.log(id, email, companieId, department)
    const screenWidth = window.innerWidth;
    this.tabs = this.data.tabs || this.tabs;
    this.url = this.data.url;
    this.callId = this.data.callId;

    console.log(this.data.tabs)

    if (!this.data || !this.data.tabs) {
      console.error('Erro: Dados não foram passados corretamente para o formulário.');
      return;
    }

    const controls: { [key: string]: any } = {};

    this.tabs.forEach(tab => {
      tab.fields.forEach(field => {
        controls[field.name] = [''];
        if (field.type === 'select' && field.optionsUrl) {
          this.http.get<any[]>(API + field.optionsUrl).subscribe(data => {
            this.options[field.name] = data;
          });
        }
      });
      // Para telas mobile (por exemplo, menos de 768px), ajusta para 1 coluna
      if (screenWidth < 768) {
        tab.columns = 1;
      } else {
        // Caso contrário, calcula o número de colunas baseado no número de campos
        tab.columns = Math.ceil(tab.fields.length / 6);
      }
    });

    this.form = this.fb.group(controls);

    this.form.patchValue({
      userId: id,
      companieIdP: companieId,
      calledId: this.callId
    });

  }

  openDialog() {
    this.dialog.open(FormComponent, { data: this.tabs });
  }

  fechar() {
    this.dialog.closeAll();
  }

  onSubmit() {
    // Definir explicitamente o tipo de acc
    const updatedValues = Object.keys(this.form.value).reduce<{ [key: string]: string }>((acc, key) => {
      // Se a chave existir em uploadedFiles, substituímos pelo nome do arquivo
      if (this.uploadedFiles[key]) {
        acc[key] = this.uploadedFiles[key]; // Pega diretamente o valor de uploadedFiles
      } else {
        // Se não, mantemos o valor original de this.form.value
        acc[key] = this.form.value[key];
      }
      return acc;
    }, {});


    //console.log(this.url)

    // Agora, envie os dados para o serviço de login
    this.service.create(updatedValues, this.url).subscribe({
      next: () => {
        this.fechar();
        window.location.reload();
      },
      error: (err) => {
        console.error('Erro ao inserir', err.error.message.message);
        alert('Não foi possível inserir. Tente novamente.' + err.error.message.message);
      }
    });
  }


  triggerFileInput(fieldName: string) {
    const inputElement = document.getElementById('file-input-' + fieldName) as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  }

  onFileSelected(event: Event, fieldName: string) {

    console.log("cheguei aqui!" + fieldName)
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.service.uploadFile(file).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total !== undefined) {  // Verifica se event.total não é undefined
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
              console.log('% concluído:', this.uploadProgress);
            }
          } else if (event.type === HttpEventType.Response) {
            console.log('Upload concluído:', event.body.path.filename);

            this.uploadedFiles[fieldName] = event.body.path.filename;
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


  onDeleteFile(fieldName: string) {


    console.log(fieldName)
    const uploadedFile = this.uploadedFiles[fieldName];

    if (uploadedFile) {
      this.service.deleteFile(uploadedFile).subscribe({
        next: (response) => {

          console.log('Arquivo excluído', response);
          // Remove a informação do objeto
          delete this.uploadedFiles[fieldName];

          const inputElement = document.getElementById('file-input-2' + fieldName) as HTMLInputElement;
          console.log(inputElement)
          if (inputElement) {
            inputElement.value = ''; // Limpa o valor do campo
          }

        },
        error: (error) => {
          console.error('Erro ao excluir o arquivo', error);
        }
      });
    }
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



}


