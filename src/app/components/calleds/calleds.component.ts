import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { CalledsService } from './calleds.service';
import { UserService } from '../core/user/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-calleds',
  standalone: true,
  imports: [MatTabsModule, CommonModule],
  templateUrl: './calleds.component.html',
  styleUrl: './calleds.component.css'
})
export class CalledsComponent implements OnInit {



  calledsPendents: any[] = [];
  calledsResponsable: any[] = [];
  calledsCompleteds: any[] = [];
  calledsAll: any[] = [];

  calledsMy: any[] = [];

  type:any;

  constructor(private serviceCalled: CalledsService, private user: UserService, private router: Router) {

  }

  ngOnInit(): void {
    this.pesquisaMy();
    this.pesquisaPendentes();
    this.pesquisaResponsavel();
    this.pesquisaTodos();
     this.type = this.user.user.type;
  }

  onTabChange(event: MatTabChangeEvent) {
    console.log(event); // Veja no console os detalhes do evento

    switch (event.index) {
      case 0:
        this.pesquisaMy();
        break;
      case 1:
        this.pesquisaPendentes();
        break;
      case 2:
        this.pesquisaResponsavel();
        break;
      case 3:
        this.pesquisaTodos();
        break;

    }
  }


  pesquisaMy() {
    const id = this.user.user.id;
    const type = this.user.user.type;
    const companieId = this.user.user.companieId;
    const department = this.user.user.department;
  

    this.serviceCalled.getMy(id, type, department, companieId).subscribe(result => {
      this.calledsMy = result;
    });
  }


  pesquisaPendentes() {
    const id = this.user.user.id;
    const type = this.user.user.type;
    const companieId = this.user.user.companieId;
    const department = this.user.user.department;
  

    this.serviceCalled.getPendents(id, type, department, companieId).subscribe(result => {
      this.calledsPendents = result;
      console.log(result)
    });
  }


  pesquisaResponsavel() {
    const id = this.user.user.id;
    const type = this.user.user.type;
    const companieId = this.user.user.companieId;
    const department = this.user.user.department;

    this.serviceCalled.getResponsable(id, type, department, companieId).subscribe(result => {
      this.calledsResponsable = result;
    });
  }

  pesquisaTodos() {
    const id = this.user.user.id;
    const type = this.user.user.type;
    const companieId = this.user.user.companieId;
    const department = this.user.user.department;

    this.serviceCalled.getAll(id, type, department, companieId).subscribe(result => {
      this.calledsAll = result;
      console.log(result)
    });
  }


  edit(arg0: any) {
    alert(arg0)
  }

  capturar(arg0: any) {

    const id = this.user.user.id;

    this.serviceCalled.getRespCall(id, arg0).subscribe(result => {
    });
  }
  view(id: number) {
    const url = `#/view/${id}`; // 🔹 URL com parâmetro
    window.open(url, '_blank');
  }

  history(id: number){
    const url = `#/history/${id}`; // 🔹 URL com parâmetro
    window.open(url, '_blank');
  }
}
