import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../core/token/token.service';
import { environment } from '../../../environments/environment';

const API = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class ProjetosService {

  constructor(private http: HttpClient, private token: TokenService) { }

  private getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    });
  }

  getList(): Observable<any[]> {
    return this.http.get<any[]>(`${API}projects/list`, { headers: this.getHeaders() });
  }

  show(id: string | number): Observable<any> {
    return this.http.get<any>(`${API}projects/show/${id}`, { headers: this.getHeaders() });
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete<any>(`${API}projects/delete/${id}`, { headers: this.getHeaders() });
  }

  listCalleds(): Observable<any[]> {
    return this.http.get<any[]>(`${API}projects/calleds`, { headers: this.getHeaders() });
  }

  addTaskCalled(taskId: string | number, calledId: string | number): Observable<any> {
    return this.http.post<any>(`${API}projects/task/${taskId}/called`, { calledId }, { headers: this.getHeaders() });
  }

  removeTaskCalled(linkId: string | number): Observable<any> {
    return this.http.delete<any>(`${API}projects/task-called/${linkId}`, { headers: this.getHeaders() });
  }

  deleteTask(taskId: string | number): Observable<any> {
    return this.http.delete<any>(`${API}projects/task/${taskId}`, { headers: this.getHeaders() });
  }
}
