import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { TokenService } from '../core/token/token.service';
const API = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class CalledDetailsService {

 constructor(private http: HttpClient,  private token: TokenService) {}
 
 private getHeaders(): HttpHeaders {
   const token = this.token.getToken();
   return new HttpHeaders({
     Authorization: `${token}`,
     'Content-Type': 'application/json',
   });
 }
 
 
 
 getCall(id:any): Observable<any[]> {
   return this.http.get<any[]>(`${API}called/list/${id}`, { headers: this.getHeaders() });
 }
 


}