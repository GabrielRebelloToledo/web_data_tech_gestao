import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../core/token/token.service';
import { User } from '../core/user/user';
import { ReportCab } from './form/reportcab';



const API = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {

  constructor(private http: HttpClient, private token: TokenService) { }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }

  create(data: any): Observable<any> {

    return this.http.post(`${API}report/create`, data, { headers: this.getHeaders(), observe: 'response' }).pipe(take(1));
  }

  update(data: any): Observable<any> {

    console.log(data)

    return this.http.post(`${API}report/update/${data.id}`, data, { headers: this.getHeaders(), observe: 'response' }).pipe(take(1));
  }
  delete(id: any): Observable<any[]> {

    return this.http.delete<any[]>(`${API}status/delete/${id}`, { headers: this.getHeaders() });
  }

  getReports(): Observable<ReportCab[]> {
    return this.http.get<ReportCab[]>(`${API}report/list`, { headers: this.getHeaders() });
  }

  getReportShow(id: any): Observable<ReportCab> {
    return this.http.get<ReportCab>(`${API}report/show/${id}`, { headers: this.getHeaders() });
  }





  getReportShowDetails(id: any): Observable<any[]> {
    return this.http.get<any[]>(`${API}report/files/list/${id}`, { headers: this.getHeaders() });
  }


  updateFile(data: any): Observable<any> {
    console.log(data)
    return this.http.post(`${API}report/files/update`, data, { headers: this.getHeaders(), observe: 'response' }).pipe(take(1));
  }




  // Arquivos

  /**
     * Envia o arquivo para a API.
     * @param file O arquivo selecionado.
     * @returns Um Observable com o progresso do upload e a resposta final.
     */
  uploadFile(file: File, id: any): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('idCabReport', id);

    // Cria a requisição com monitoramento de progresso
    const req = new HttpRequest('POST', `${API}report/files/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }


  deleteFiles(dados: any) {
    return this.http.post(`${API}report/files/delete`, { arquivos: dados }).pipe(take(1))
  }


  downloadFile(nomes: string[], id: any): Observable<Blob> {
    return this.http.post(`${API}report/files/show/${id}`, { arquivos: nomes }, {
      responseType: 'blob'
    });
  }


  paramsReport(id: any): Observable<any[]> {
    console.log(id)
    return this.http.get<any[]>(`${API}report/show/parameters/${id}`, { headers: this.getHeaders() });
  }

  gerarReport(id: any, body: any): Observable<Blob> {

    console.log("Aqui!")
    console.log(id)
    return this.http.post(`${API}report/show/gerar/${id}`, body, { headers: this.getHeaders(), responseType: 'blob' });
  }

}