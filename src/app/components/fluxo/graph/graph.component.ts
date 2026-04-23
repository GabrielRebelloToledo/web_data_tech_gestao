import { Component, OnInit } from '@angular/core';
import { ProcessComponent } from "../process/process.component";
import { Node, Project } from '../node/node.model';
import { CommonModule } from '@angular/common';
import { ShellComponent } from '../../shell/shell.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [ProcessComponent, CommonModule, ShellComponent, RouterModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent implements OnInit {


  rawData: Project[] = [
    {
      projeto: 'Pistache',
      datapast: '01/01/2024',
      dataenvase: '01/01/2024',
      linhas: [
        { id: 1, label: 'Recebimento de NF', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 2, label: 'Conferência NF x MP', status: 'concluída', color: 'blue', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 3, label: 'Puxada de MP', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 4, label: 'Produção', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 5, label: 'Conferência fim de produção', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 6, label: 'Emissão de NFs', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 7, label: 'Devolução de MP', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },

      ]
    },
    {
      projeto: 'Chocolate',
      datapast: '01/01/2024',
      dataenvase: '01/01/2024',
      linhas: [
        { id: 1, label: 'Caixa 1', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 2, label: 'Caixa 2', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 3, label: 'Caixa 3', status: 'concluída', color: 'red', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 4, label: 'Caixa 4', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 5, label: 'Caixa 5', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 6, label: 'Caixa 6', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 7, label: 'Caixa 7', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
      ]
    },
    {
      projeto: 'Morango',
      datapast: '01/01/2024',
      dataenvase: '01/01/2024',
      linhas: [
        { id: 1, label: 'Caixa 1', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 2, label: 'Caixa 2', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 3, label: 'Caixa 3', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 4, label: 'Caixa 4', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 5, label: 'Caixa 5', status: 'concluída', color: 'yellow', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 6, label: 'Caixa 6', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 7, label: 'Caixa 7', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
      ]
    },
    {
      projeto: 'Morango',
      datapast: '01/01/2024',
      dataenvase: '01/01/2024',
      linhas: [
        { id: 1, label: 'Caixa 1', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 2, label: 'Caixa 2', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 3, label: 'Caixa 3', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 4, label: 'Caixa 4', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 5, label: 'Caixa 5', status: 'concluída', color: 'yellow', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 6, label: 'Caixa 6', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 7, label: 'Caixa 7', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
      ]
    },
    {
      projeto: 'Morango',
      datapast: '01/01/2024',
      dataenvase: '01/01/2024',
      linhas: [
        { id: 1, label: 'Caixa 1', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 2, label: 'Caixa 2', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 3, label: 'Caixa 3', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 4, label: 'Caixa 4', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 5, label: 'Caixa 5', status: 'concluída', color: 'yellow', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 6, label: 'Caixa 6', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 7, label: 'Caixa 7', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
      ]
    },
    {
      projeto: 'Morango',
      datapast: '01/01/2024',
      dataenvase: '01/01/2024',
      linhas: [
        { id: 1, label: 'Caixa 1', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 2, label: 'Caixa 2', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 3, label: 'Caixa 3', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 4, label: 'Caixa 4', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 5, label: 'Caixa 5', status: 'concluída', color: 'yellow', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 6, label: 'Caixa 6', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 7, label: 'Caixa 7', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
      ]
    },
    {
      projeto: 'Morango',
      datapast: '01/01/2024',
      dataenvase: '01/01/2024',
      linhas: [
        { id: 1, label: 'Caixa 1', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 2, label: 'Caixa 2', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 3, label: 'Caixa 3', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 4, label: 'Caixa 4', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 5, label: 'Caixa 5', status: 'concluída', color: 'yellow', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 6, label: 'Caixa 6', status: 'concluída', color: 'green', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
        { id: 7, label: 'Caixa 7', status: 'concluída', color: 'red', description: 'Desc 1', createdAt: '2025-02-01', closedAt: '2025-02-05' },
      ]
    }
  ];

  processes: any[] = [];

  ngOnInit(): void {
    this.createProcesses();
  }

  createProcesses(): void {
    this.rawData.forEach((project, index) => {
    
      this.processes.push({ processId: project.projeto, dataPast : project.datapast,  dataEnv: project.dataenvase, nodes: project.linhas });
    });
  }



}
