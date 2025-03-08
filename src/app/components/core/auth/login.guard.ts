import { Injectable } from '@angular/core';

import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({ providedIn: 'root'})
export class LoginGuard implements CanActivate {

    constructor(
        private userService: UserService,
        private router: Router) {}

    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

      const isLogged = this.userService.isLogged();

      if (isLogged) {
          // Se já estiver logado, redireciona para a página inicial
          this.router.navigate(['inicio']);
          return false; // Retorna false para indicar que a navegação foi impedida
      }

      return true; // Retorna true para permitir a navegação
  }
}