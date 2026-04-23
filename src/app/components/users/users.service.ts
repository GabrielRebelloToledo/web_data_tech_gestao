import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../core/token/token.service';
import { type } from 'os';
import { Observable, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../core/user/user';
const API = environment.BASE_URL;
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient, private token: TokenService) { }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }


  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${API}sessions/list`, { headers: this.getHeaders() });
  }

  getIdUsuarios(id:any): Observable<User> {
    return this.http.get<User>(`${API}sessions/show/${id}`, { headers: this.getHeaders() });
  }

  create(data: any): Observable<any> {

    return this.http.post(`${API}sessions/create`, data, { headers: this.getHeaders() }).pipe(take(1));
  }

  update(data: any): Observable<any> {

    return this.http.post(`${API}sessions/update/${data.id}`, data, { headers: this.getHeaders() }).pipe(take(1));
  }
  
  delete(id: any): Observable<any[]> {

    return this.http.delete<any[]>(`${API}status/delete/${id}`, { headers: this.getHeaders() });
  }


  getUser(id:any): Observable<User> {

    return this.http.get<User>(`${API}sessions/show/${id}`, { headers: this.getHeaders() });
  }
}
