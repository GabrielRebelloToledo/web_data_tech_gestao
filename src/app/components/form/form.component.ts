import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';
import { FormService } from './form.service';
import { UserService } from '../core/user/user.service';
import { LoadingComponent } from "../loading/loading/loading.component";
import { ComboboxComponent } from '../shared/combobox/combobox.component';


export interface FormFieldConfig {
  name: string;
  placeholder: string;
  type: 'text' | 'email' | 'password' | 'select' | 'number' | 'check' | 'file' | 'date' | 'txtarea';
  route?: string;
  optionsUrl?: string;
  /** When true the field is hidden from the UI (legacy naming: `visible === true` means hidden). */
  visible?: boolean,
  required: boolean,
  /** Raw default value applied on form init. */
  defaultValue?: any,
  /** For selects: match against option.name/option.status to auto-select the id. */
  defaultValueName?: string,
  /** Explicit label key for the option objects (otherwise auto-detected). */
  labelKey?: string,
  /** Optional helper text shown below the field. */
  helper?: string,
  /** Static options for select (alternative to optionsUrl). */
  options?: Array<{ id: any; name?: string; status?: string; [k: string]: any }>
}

export interface TabConfig {
  title: string;
  fields: FormFieldConfig[];
  columns?: number;
}

export interface FormDialogHeader {
  icon?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export interface FormDialogData {
  tabs: TabConfig[];
  url: string;
  callId?: string;
  skipReload?: boolean;
  header?: FormDialogHeader;
  submitLabel?: string;
  submitIcon?: string;
  loadingMessage?: string;
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
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatTabsModule, LoadingComponent, ComboboxComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {


  // Objeto para armazenar os uploads. A chave será o nome do campo.
  uploadedFiles: { [key: string]: string } = {};

  mensagemCarregamento = "";
  spinner: boolean = false;

  uploadProgress = -1;

  @Input() tabs: TabConfig[] = [];
  @Input() url: any;
  @Input() callId: any;
  form: FormGroup | any;
  options: { [key: string]: any[] } = {};
  columns: number | any;

  header: Required<FormDialogHeader> = {
    icon: 'support_agent',
    eyebrow: 'Novo chamado',
    title: '',
    subtitle: 'Preencha os campos obrigatórios para abrir seu chamado.'
  };
  submitLabel = 'Abrir chamado';
  submitIcon = 'send';

  constructor(private user: UserService, private fb: FormBuilder, private router: Router, private http: HttpClient, private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: FormDialogData, private service: FormService) { }


  ngOnInit() {
    const id = this.user.user.id;
    const screenWidth = window.innerWidth;
    this.tabs = this.data.tabs || this.tabs;
    this.url = this.data.url;
    this.callId = this.data.callId;

    if (!this.data || !this.data.tabs?.length) {
      console.error('Erro: Dados não foram passados corretamente para o formulário.');
      return;
    }

    // Apply per-dialog header / submit config (falls back to called defaults)
    const title = this.data.tabs[0].title;
    const isTicketHistory = title === 'História do Chamado';
    const isTicketNew = title === 'Cadastro de Chamado' || title?.toLowerCase().startsWith('abertura');

    if (this.data.header) {
      this.header = { ...this.header, ...this.data.header, title: this.data.header.title ?? title };
    } else if (isTicketHistory) {
      this.header = { icon: 'support_agent', eyebrow: 'Nova atualização', title, subtitle: 'Preencha os campos obrigatórios (*) para registrar uma atualização.' };
    } else if (isTicketNew) {
      this.header = { icon: 'support_agent', eyebrow: 'Novo chamado', title, subtitle: 'Preencha os campos obrigatórios (*) para abrir seu chamado.' };
    } else {
      // Non-ticket dialogs: use the tab title as heading, neutral subtitle
      this.header = { icon: 'edit_square', eyebrow: 'Formulário', title, subtitle: 'Preencha os campos obrigatórios (*).' };
    }

    this.submitLabel = this.data.submitLabel
      ?? (isTicketHistory ? 'Enviar atualização'
        : isTicketNew ? 'Abrir chamado'
        : 'Salvar');
    this.submitIcon = this.data.submitIcon ?? (isTicketNew || isTicketHistory ? 'send' : 'check');
    this.mensagemCarregamento = this.data.loadingMessage
      ?? (isTicketHistory ? 'Enviando atualização…'
        : isTicketNew ? 'Abrindo chamado…'
        : 'Salvando…');

    const controls: { [key: string]: any } = {};

    this.tabs.forEach(tab => {
      tab.fields.forEach(field => {
        const initialValue = field.defaultValue ?? '';
        controls[field.name] = field.required ? [initialValue, Validators.required] : [initialValue];
        if (field.type === 'select') {
          if (field.options && field.options.length) {
            this.options[field.name] = field.options.map(o => this.decorateOption(o, field));
          } else if (field.optionsUrl) {
            this.service.getSelect(field.optionsUrl).subscribe(data => {
              this.options[field.name] = (data || []).map(o => this.decorateOption(o, field));

              if (field.defaultValueName && this.form?.get(field.name)) {
                const target = field.defaultValueName.toLowerCase();
                const match = this.options[field.name].find(o =>
                  (o.__label || '').toString().toLowerCase() === target
                );
                if (match) this.form.get(field.name)!.setValue(match.id);
              }
            });
          }
        }
      });

      if (screenWidth < 768) {
        tab.columns = 1;
      } else {
        tab.columns = Math.ceil(tab.fields.length / 6);
      }
    });

    this.form = this.fb.group(controls);

    this.form.patchValue({
      userId: id,
      calledId: this.callId
    });
  }

  /** Normalise an option adding a `__label` property we can safely bind to. */
  private decorateOption(option: any, field: FormFieldConfig): any {
    const key = field.labelKey;
    const raw = key ? option[key]
      : (option.name ?? option.status ?? option.department ?? option.title ?? option.label ?? '');
    const label = (raw ?? '').toString();
    const formatted = label ? this.capitalizeFirstLetter(label) : '';
    return { ...option, __label: formatted };
  }


  reloadSelect(name: any, url: any) {
    const field = this.findFieldByName(name);
    if (!field || !url) return;
    this.service.getSelect(url).subscribe(data => {
      this.options[name] = (data || []).map(o => this.decorateOption(o, field));
    });
  }

  private findFieldByName(name: string): FormFieldConfig | undefined {
    for (const tab of this.tabs) {
      const f = tab.fields.find(f => f.name === name);
      if (f) return f;
    }
    return undefined;
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


    /*  console.log(updatedValues) */

    // Agora, envie os dados para o serviço de login
    // O envio do form esta correto com os espaçamentos. usado <pre> no retorno.

    this.spinner = true;

    this.service.create(updatedValues, this.url).subscribe({
      next: () => {
        this.spinner = false;
        this.dialog.closeAll();
        if (!this.data?.skipReload) {
          window.location.reload();
        }
      },
      error: (err) => {
        this.spinner = false;
        const msg = err?.error?.message?.message || err?.error?.message || 'Erro ao salvar';
        alert('Não foi possível salvar. ' + msg);
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


  capitalizeFirstLetter(input: string): string {
    if (input.length === 0) return input; // Caso a string esteja vazia

    // Pega a primeira letra, converte para maiúscula e concatena com o resto da string em minúscula
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  }

}


