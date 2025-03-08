import { Directive, Injectable, Injector } from "@angular/core";
import { HTTP_INTERCEPTORS, HttpInterceptor } from "@angular/common/http";
import { HttpRequest } from "@angular/common/http";
import { HttpHandler } from "@angular/common/http";
import { Observable, throwError as observableThrowError, throwError } from "rxjs";
import { HttpSentEvent } from "@angular/common/http";
import { HttpHeaderResponse } from "@angular/common/http";
import { HttpProgressEvent } from "@angular/common/http";
import { HttpResponse } from "@angular/common/http";
import { HttpUserEvent } from "@angular/common/http";

import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

import { TokenService } from "../token/token.service";


import { UserService } from "../user/user.service";
import { environment } from "../../../../environments/environment";

const API = environment.BASE_URL;

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

    constructor(
        private tokenService: TokenService,
        private userService: UserService,
        private router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent
        | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

            if (req.url === `${API}login`) {
                console.log("aqui");
                return next.handle(req);
            }

            if (this.tokenService.hasToken()) {
                const token = this.tokenService.getToken();
                console.log(token);

                // Verifica se o token expirou
                if (this.tokenService.isTokenExpired(token)) {
                    // Token expirado, realize as ações necessárias
                    this.userService.logout();
                    this.router.navigate(['']);
                    alert('Sua sessão expirou');
                    return throwError('Sua sessão expirou');
                }

                // Token não expirado, continua a requisição normalmente
                req = req.clone({
                    setHeaders: {
                        'Authorization': token!
                    }
                });
            }

            return next.handle(req).pipe(
                catchError(err => {
                    console.log(err);

                    // Coloque sua lógica de tratamento de erro aqui
                    // Por exemplo, tratamento específico para o status 401
                    if (err.status === 401) {
                        this.userService.logout();
                        this.router.navigate(['']);
                        alert('Sua sessão expirou');
                        return throwError('Sua sessão expirou');
                    }

                    // Continue a propagação do erro se não for um erro específico que você está tratando
                    return throwError(err);
                })
            );
    }
}