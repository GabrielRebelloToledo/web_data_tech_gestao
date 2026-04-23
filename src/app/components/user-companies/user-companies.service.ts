import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../core/token/token.service';
import { type } from 'os';
import { Observable, take } from 'rxjs';
import { environment } from '../../../environments/environment';
const API = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class UserCompaniesService {

  constructor(private http: HttpClient, private token: TokenService) { }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }


  createUserCompanie(data: any): Observable<any> {
    return this.http.post(`${API}usercompanies`, data, { headers: this.getHeaders() }).pipe(take(1));
  }

  getUserCompanies(id: any): Observable<any[]> {

    return this.http.get<any[]>(`${API}usercompanies/show/${id}`, { headers: this.getHeaders() });
  }

  delete(id: any, idcomp: any): Observable<any[]> {
    return this.http.delete<any[]>(`${API}usercompanies/delete/${id}/${idcomp}`, { headers: this.getHeaders() });
  }


}