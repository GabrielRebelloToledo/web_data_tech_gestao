import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { TokenService } from '../core/token/token.service';


const API = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})

export class FormService {

  constructor(private http: HttpClient, private token: TokenService) { }
  
    private getHeaders(): HttpHeaders {
      const token = this.token.getToken();
      return new HttpHeaders({
        Authorization: `${token}`,
        'Content-Type': 'application/json',
      });
    }

  /**
   * Envia o arquivo para a API.
   * @param file O arquivo selecionado.
   * @returns Um Observable com o progresso do upload e a resposta final.
   */
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();  
    formData.append('arquivo', file);

    // Cria a requisição com monitoramento de progresso
    const req = new HttpRequest('POST', `${API}upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }


  deleteFile(file:any){
    return this.http.delete(`${API}upload/delete/${file}`).pipe(take(1))
  }


  downloadFile(fileName:any){

    return this.http.get(`${API}upload/show/${fileName}`, {
      responseType: 'blob' // Para arquivos binários
    }); 
  }

  create(updatedValues: { [key: string]: string }, url:string): Observable<any> {
    return this.http.post(`${API}${url}`, updatedValues, { headers: this.getHeaders() }).pipe(take(1));
  }



    getSelect(url:string): Observable<any[]> {
      return this.http.get<any[]>(`${API}${url}`, { headers: this.getHeaders() });
    }
 
}
