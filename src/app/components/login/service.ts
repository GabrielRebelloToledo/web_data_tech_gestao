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

  /** Primeiro acesso — passo 1: pede o código de 6 dígitos por e-mail. */
  requestFirstAccess(email: string) {
    return this.http.post(`${API}sessions/first-access/request`, { email }).pipe(take(1));
  }

  /** Primeiro acesso — passo 2: valida o código e define a senha. */
  confirmFirstAccess(payload: { email: string; code: string; password: string }) {
    return this.http.post(`${API}sessions/first-access/confirm`, payload).pipe(take(1));
  }

}