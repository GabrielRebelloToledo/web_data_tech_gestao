import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../core/token/token.service';
import { environment } from '../../../environments/environment';
const API = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class DepartmetsService {
  constructor(private http: HttpClient, private token: TokenService) { }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }



  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${API}departments/list`, { headers: this.getHeaders() });
  }

  delete(id:any): Observable<any[]>{
    return this.http.delete<any[]>(`${API}departments/delete/${id}`, { headers: this.getHeaders() });
  }
}
