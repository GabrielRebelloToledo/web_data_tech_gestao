import { TabConfig } from "../../../form/form.component";

export const RECEBIMENTO_NF_FORM_CONFIG: TabConfig[] = [
    {
        title: 'Recebimento de NF',
        fields: [
          { name: 'nronf', placeholder: 'Nros NFs', type: 'text' , required: true},
          { name: 'data', placeholder: 'Data/Hora', type: 'date', required: true },
          { name: 'obs', placeholder: 'Observação', type: 'text', required: true },
          { name: 'filenf1', placeholder: 'Nf 1', type: 'file' , required: true},
          { name: 'filenf2', placeholder: 'Nf 2', type: 'file' , required: true},
          { name: 'filenf3', placeholder: 'Nf 3', type: 'file' , required: true},
          { name: 'filenf4', placeholder: 'Nf 4', type: 'file' , required: true},
          { name: 'status', placeholder: 'Status', type: 'select', optionsUrl: 'user-sales/salesman/list', required: true }
        ]
      },
];
