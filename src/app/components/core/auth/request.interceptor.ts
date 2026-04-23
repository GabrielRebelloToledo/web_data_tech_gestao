// request.interceptor.ts
import {
    HttpInterceptorFn,
    HttpRequest,
    HttpHandlerFn,
    HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const requestInterceptorFn: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
    const tokenService = inject(TokenService);
    const userService = inject(UserService);
    const router = inject(Router);

    if (req.url.endsWith('/inicio')) {
        console.log('Requisição de login, passando direto...');
        return next(req);
    }

    if (tokenService.hasToken()) {
        const token = tokenService.getToken();
        console.log('Token encontrado:', token);

        if (tokenService.isTokenExpired(token)) {
            console.log('Token expirado. Redirecionando...');
            userService.logout();
            router.navigate(['']);
            alert('Sua sessão expirou');
            return throwError(() => new Error('Sua sessão expirou'));
        }

        req = req.clone({
            setHeaders: {
                Authorization: token!
            }
        });
    }

    return next(req).pipe(
        catchError(err => {
            console.log('Erro capturado no interceptor:', err);
            if (err.status === 401 && err.error.message.appErrorType != "As credenciais fornecidas são inválidas. Verifique seu e-mail e senha.") {
                userService.logout();
                router.navigate(['']);
                alert('Sua sessão expirou');
                return throwError(() => new Error('Sua sessão expirou'));
            }
            return throwError(() => err);
        })
    );
};
