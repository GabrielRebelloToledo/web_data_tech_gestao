import { Injectable } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import { environment } from '../../../../environments/environment';
import { User } from './user';
import { TokenService } from '../token/token.service';


const API = environment.BASE_URL;

@Injectable({ providedIn: 'root' })


export class UserService {

    user!: User;


    // assim que inicia o serviço, verifica se existe o token e faz a decodificação
    constructor(private tokenService: TokenService) {
        this.tokenService.hasToken() &&
            this.decodeAndNotify();
    }

    setToken(token: string) {
        this.tokenService.setToken(token);
        this.decodeAndNotify();
    }

    getUser() {
        return this.user;
    }

    private decodeAndNotify() {
        const token = this.tokenService.getToken();
        this.user = jwtDecode(token!) as User;
    }

    logout() {
        this.tokenService.removeToken();
        this.user = null!;
    }

    isLogged() {
        return this.tokenService.hasToken();
    }



}