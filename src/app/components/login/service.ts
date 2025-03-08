import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable, take } from 'rxjs';
import { TokenService } from '../core/token/token.service';
import { User } from '../core/user/user';



const API = environment.BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class LService {

  constructor(

    private http: HttpClient,
    private token: TokenService

    ) { }


  login(user: User) {
    
    return this.http.post(`${API}sessions`, user ).pipe(take(1))

  }
  
}