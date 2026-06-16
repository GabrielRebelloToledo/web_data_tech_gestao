import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../core/token/token.service';
import { environment } from '../../../environments/environment';

const API = environment.BASE_URL;

export interface UserGroupPayload {
  name: string;
  active: string;
  userIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class UsergroupsService {

  constructor(private http: HttpClient, private token: TokenService) { }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }

  getList(): Observable<any[]> {
    return this.http.get<any[]>(`${API}usergroups/list`, { headers: this.getHeaders() });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${API}sessions/list`, { headers: this.getHeaders() });
  }

  create(payload: UserGroupPayload): Observable<any> {
    return this.http.post<any>(`${API}usergroups`, payload, { headers: this.getHeaders() });
  }

  update(id: number, payload: UserGroupPayload): Observable<any> {
    return this.http.post<any>(`${API}usergroups/update/${id}`, payload, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${API}usergroups/delete/${id}`, { headers: this.getHeaders() });
  }
}
