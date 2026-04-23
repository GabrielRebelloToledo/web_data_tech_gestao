import { Component, OnInit } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportServiceService } from '../report-service.service';
import { ReportCab } from '../form/reportcab';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../filter.pipe';
import { ShellComponent } from '../../shell/shell.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe, ShellComponent],
  templateUrl: './reports-list.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {



  listReportCab: ReportCab[] = [];

  // Filtros variaveis


  buscaNroRelatorio: any;
  buscaNome: any;
  buscaTipo: any;
  buscarDados: any;
  filtroAtivo: string | null = null;
  filtrosSelecionados: { [coluna: string]: string[] } = {};

  valoresIdReport: string[] = [];
  valoresNome: string[] = [];
  valoresTipo: string[] = [];

  //Resultado dos filtros ativos
  dadosFiltrados: any[] = [];

  //Paginação
  datasPages: ReportCab[] = [];
  page = 1;
  itemsPerPage = 5;

  //Ordernar coluna
  ordenarColuna: string = '';
  ordenarAsc: boolean = true;


  ngOnInit(): void {

    this.pesquisaReports();
  }


  constructor(private service: ReportServiceService, private router: Router, private route: ActivatedRoute) { }

  pesquisaReports() {

    this.service.getReports().subscribe(result => {
      this.listReportCab = result;
      this.iniciarTabela();
      console.log(result)
      this.valoresIdReport = [...new Set(this.listReportCab.map(c => c.id))];
      this.valoresNome = [...new Set(this.listReportCab.map(c => c.nome))];
      this.valoresTipo = [...new Set(this.listReportCab.map(c => c.type))];
    });


  }

  iniciarTabela() {
    this.filtrosSelecionados = {};
    this.page = 1;
    this.filtrosSelecionados = {}; // limpa filtros ao trocar de aba, se quiser
    this.dadosFiltrados = [...this.getListaBruta()];
    this.atualizarPagina();
  }


  getListaBruta(): any[] {
    return this.listReportCab;
  }

  //Lista se possuir já os dados filtrados
  getListaAtual(): any[] {

    console.log(this.dadosFiltrados)
    return this.dadosFiltrados;
  }


  atualizarPagina() {
    const inicio = (this.page - 1) * this.itemsPerPage;
    const fim = inicio + this.itemsPerPage;
    this.datasPages = this.getListaAtual().slice(inicio, fim);
  }


  mudarPagina(novaPagina: number) {
    if (novaPagina < 1 || novaPagina > this.totalPaginas()) return;
    this.page = novaPagina;
    this.atualizarPagina();
  }


  totalPaginas(): number {
    return Math.ceil(this.getListaAtual().length / this.itemsPerPage);
  }

  totalPaginasArray(): number[] {

    return Array(this.totalPaginas()).fill(0).map((_, i) => i + 1);
  }


  // Filtros
  abrirFiltro(coluna: string) {
    this.filtroAtivo = this.filtroAtivo === coluna ? null : coluna;

  }

  todosSelecionados(coluna: string, opcoes: string[]): boolean {
    const selecionados = this.filtrosSelecionados[coluna] || [];
    return opcoes.every(opcao => selecionados.includes(opcao));
  }

  toggleTodos(coluna: string, opcoes: string[]) {
    if (this.todosSelecionados(coluna, opcoes)) {
      // Desmarca todos
      this.filtrosSelecionados[coluna] = this.filtrosSelecionados[coluna].filter(v => !opcoes.includes(v));
    } else {
      // Marca todos (mantendo os que já estavam)
      const set = new Set([...(this.filtrosSelecionados[coluna] || []), ...opcoes]);
      this.filtrosSelecionados[coluna] = Array.from(set);
    }
  }

  toggleFiltro(coluna: string, valor: string) {

    console.log(coluna)
    console.log(valor)
    if (!this.filtrosSelecionados[coluna]) this.filtrosSelecionados[coluna] = [];

    const idx = this.filtrosSelecionados[coluna].indexOf(valor);
    if (idx > -1) {
      // Cria um novo array sem o valor removido
      this.filtrosSelecionados[coluna] = this.filtrosSelecionados[coluna].filter(v => v !== valor);
    } else {
      // Cria um novo array com o valor adicionado
      this.filtrosSelecionados[coluna] = [...this.filtrosSelecionados[coluna], valor];
    }
  }

  aplicarFiltros() {
    const base = this.getListaBruta();

    this.dadosFiltrados = base.filter(item => {

      console.log(this.filtrosSelecionados)
      for (const coluna in this.filtrosSelecionados) {
        const valores = this.filtrosSelecionados[coluna];
        if (valores.length && !valores.includes(item[coluna])) {
          return false;
        }
      }
      return true;
    });

    this.page = 1;
    this.atualizarPagina();
    this.filtroAtivo = null;
  }

  /*   trocarAba(novaAba: number) {
      this.filtrosSelecionados = {};
      this.page = 1;
      this.filtrosSelecionados = {}; // limpa filtros ao trocar de aba, se quiser
      this.dadosFiltrados = [...this.getListaBruta()];
      this.atualizarPagina();
    } */



  ordenarPor(coluna: string) {
    if (this.ordenarColuna === coluna) {
      this.ordenarAsc = !this.ordenarAsc;
    } else {
      this.ordenarColuna = coluna;
      this.ordenarAsc = true;
    }

    const lista = this.getListaAtual(); // ou this.calledsFiltrados, se você já filtra

    this.dadosFiltrados = [...lista].sort((a, b) => {
      let valA = a[coluna];
      let valB = b[coluna];

      // Tentativa de detectar número
      const isNumber = !isNaN(valA) && !isNaN(valB);

      if (isNumber) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA?.toString().toLowerCase() ?? '';
        valB = valB?.toString().toLowerCase() ?? '';
      }

      if (valA < valB) return this.ordenarAsc ? -1 : 1;
      if (valA > valB) return this.ordenarAsc ? 1 : -1;
      return 0;
    });

    this.mudarPagina(1); // Reseta para a primeira página
  }


  relatorio(id: any) {
    this.router.navigate(['/cabreport', id]);
  }

  novo() {
    this.router.navigate(['/cabreport']);
  }
}
