import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { TokenService } from '../core/token/token.service';
const API = environment.BASE_URL;


@Injectable({
  providedIn: 'root'
})
export class CalledsService {

constructor(private http: HttpClient,  private token: TokenService) {}

private getHeaders(): HttpHeaders {
  const token = this.token.getToken();
  return new HttpHeaders({
    Authorization: `${token}`,
    'Content-Type': 'application/json',
  });
}



getPendents(id:number,type:string,department:number,companieId:number): Observable<any[]> {
  console.log(id,type,department,companieId)
  return this.http.get<any[]>(`${API}called/listp/${id}/${type}/${department}/${companieId}`, { headers: this.getHeaders() });
}

getMy(id:number,type:string,department:number,companieId:number): Observable<any[]> {
  console.log(id,type,department,companieId)
  return this.http.get<any[]>(`${API}called/listm/${id}/${type}/${department}/${companieId}`, { headers: this.getHeaders() });
}


getResponsable(id:number,type:string,department:number,companieId:number): Observable<any[]> {
  return this.http.get<any[]>(`${API}called/listr/${id}/${type}/${department}/${companieId}`, { headers: this.getHeaders() });
}


getAll(id:number,type:string,department:number,companieId:number): Observable<any[]> {
  return this.http.get<any[]>(`${API}called/listc/${id}/${type}/${department}/${companieId}`, { headers: this.getHeaders() });
}

getCall(id:any): Observable<any[]> {
  return this.http.get<any[]>(`${API}called/show/${id}`, { headers: this.getHeaders() });
}


getRespCall(userId:any, id:any){
  return this.http.put<any[]>(`${API}called/update/${id}`, {userId: userId} ,{ headers: this.getHeaders() }).pipe(take(1));
}

}
