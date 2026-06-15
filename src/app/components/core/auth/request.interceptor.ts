// request.interceptor.ts
import {
    HttpInterceptorFn,
    HttpRequest,
    HttpHandlerFn,
    HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Guard contra múltiplos disparos: vários requests em paralelo podem falhar
// com o mesmo token expirado, mas só queremos deslogar/avisar uma vez.
let sessionExpiredHandled = false;

function handleSessionExpired(
    userService: UserService,
    router: Router,
    snackBar: MatSnackBar
) {
    if (sessionExpiredHandled) {
        return;
    }
    sessionExpiredHandled = true;

    userService.logout();
    router.navigate(['']);
    snackBar.open('Sua sessão expirou. Faça login novamente.', 'Fechar', {
        duration: 4000,
        panelClass: ['snackbar-info']
    });

    // Libera o guard depois de um intervalo, para uma futura expiração
    // (após novo login) voltar a ser sinalizada normalmente.
    setTimeout(() => { sessionExpiredHandled = false; }, 5000);
}

export const requestInterceptorFn: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
    const tokenService = inject(TokenService);
    const userService = inject(UserService);
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);

    if (req.url.endsWith('/inicio')) {
        return next(req);
    }

    if (tokenService.hasToken()) {
        const token = tokenService.getToken();

        if (tokenService.isTokenExpired(token)) {
            handleSessionExpired(userService, router, snackBar);
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
            if (err.status === 401 && err.error?.message?.appErrorType != "As credenciais fornecidas são inválidas. Verifique seu e-mail e senha.") {
                handleSessionExpired(userService, router, snackBar);
                return throwError(() => new Error('Sua sessão expirou'));
            }
            return throwError(() => err);
        })
    );
};
