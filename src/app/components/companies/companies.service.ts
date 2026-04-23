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
export class CompaniesService {

  constructor(private http: HttpClient, private token: TokenService) { }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }



  getCompanies(): Observable<any[]> {

    return this.http.get<any[]>(`${API}companies/list`, { headers: this.getHeaders() });
  }

  delete(id: any): Observable<any[]> {
    return this.http.delete<any[]>(`${API}companies/delete/${id}`, { headers: this.getHeaders() });
  }


  //Vinculo Empresa e Departamentos

  getCompaniesDepartment(id: any): Observable<any[]> {
    return this.http.get<any[]>(`${API}compdep/list/${id}`, { headers: this.getHeaders() });
  }

  getCompaniesDepartmentUser(codemp: any, coddep: any): Observable<any[]> {
    return this.http.get<any[]>(`${API}compdep/list/${codemp}/${coddep}`, { headers: this.getHeaders() });
  }

  createCompanieDeparment(data: any): Observable<any> {
    return this.http.post(`${API}compdep`, data, { headers: this.getHeaders() }).pipe(take(1));
  }


  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${API}usercompanies/list`, { headers: this.getHeaders() });
  }

  createCompanieDeparmentUser(data: any): Observable<any> {
    return this.http.post(`${API}compdepuser`, data, { headers: this.getHeaders() }).pipe(take(1));
  }

  getCompanieDeparmentUser(id:any): Observable<any[]> {
    return this.http.get<any[]>(`${API}compdepuser/list/${id}`, { headers: this.getHeaders() });
  }


  deleteCompanieDeparmentUser(id:any): Observable<any[]> {
    return this.http.delete<any[]>(`${API}compdepuser/delete/${id}`, { headers: this.getHeaders() });
  }

  

}
