import { TabConfig } from "../../form/form.component";

export const FORM_CONFIG_CALLED: TabConfig[] = [
    {
        title: 'Recebimento de NF',
        fields: [
          { name: 'userId', placeholder: 'Cód. do Usuário', type: 'number'},
          { name: 'companieIdP', placeholder: 'Cód. Empresa Principal', type: 'number'},
          { name: 'companieIdS', placeholder: 'Empresa Abertura', type: 'select', optionsUrl: ''},
          { name: 'reason', placeholder: 'Motivo da Abertura', type: 'txtarea' },
          { name: 'filenf1', placeholder: 'Nf 1', type: 'file' },
          { name: 'filenf2', placeholder: 'Nf 2', type: 'file'},
          { name: 'filenf3', placeholder: 'Nf 3', type: 'file',  },
          { name: 'filenf4', placeholder: 'Nf 4', type: 'file',  },
          { name: 'filenf4', placeholder: 'Nf 4', type: 'file', },
          { name: 'status', placeholder: 'Status', type: 'select', optionsUrl: '',  },
          { name: 'dataFinish', placeholder: 'Data Fim', type: 'date',  }
        ]
      },
];
