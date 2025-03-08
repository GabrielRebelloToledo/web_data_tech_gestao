import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';



@Injectable({ providedIn: 'root'})
export class AuthGuard implements CanActivate {

    constructor(
        private userService: UserService,
        private router: Router) {}

    /* Guarda de rotas para ser utilizada nas rotas
       que não devem ser acessadas se o usuário não estiver logado*/

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
            //console.log("TESTE:",route.routeConfig.path,"+ ", this.userService.getUser())
            if(!this.userService.isLogged()){

                this.router.navigate(/* login */
                    [''],
                    {
                        queryParams: {
                            fromUrl: state.url
                        }
                    }
                );
                return false;
            }
            /* else if((route.routeConfig!.path == 'relatorio-saldos' || route.routeConfig.path == 'relatorio-creditos' || route.routeConfig.path == 'editar/produto/:id' || route.routeConfig.path == 'compra/aluno/:id' || route.routeConfig.path == 'produtos' || route.routeConfig.path == 'cadastrar/produto' || route.routeConfig.path == 'gerarSenha') && this.userService.getUser().perfil != 'adm'){
                //console.log("DENIED")
                return false;
            }
            else if((route.routeConfig!.path == 'cadastrar/aluno') && this.userService.getUser().perfil != 'users'){
                //console.log("DENIED")
                return false;
            } */
            return true;
    }
}