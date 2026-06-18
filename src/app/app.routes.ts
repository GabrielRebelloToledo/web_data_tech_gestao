import { Routes } from '@angular/router';
import { GraphComponent } from './components/fluxo/graph/graph.component';
import { LoginGuard } from './components/core/auth/login.guard';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './components/core/auth/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { CalledDetailComponent } from './components/called-detail/called-detail.component';
import { SetoresComponent } from './components/setores/setores.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { UsersComponent } from './components/users/users.component';
import { ListReportsComponent } from './components/reports/list-reports/list-reports.component';
import { FormComponent } from './components/reports/form/form.component';
import { ReportsComponent } from './components/reports/reports/reports.component';
import { ImagesComponent } from './components/images/images.component';
import { KbComponent } from './components/kb/kb.component';
import { UsergroupsComponent } from './components/usergroups/usergroups.component';
import { ProjetosComponent } from './components/projetos/projetos.component';
import { ProjetoDetalheComponent } from './components/projetos/projeto-detalhe.component';

export const routes: Routes = [
    { path: '', component: LoginComponent, canActivate: [LoginGuard] },

    { path: 'inicio', component: HomeComponent, canActivate: [AuthGuard] },

    // Unified ticket detail (view + history + new comment)
    { path: 'chamado/:id', component: CalledDetailComponent, canActivate: [AuthGuard] },
    // Legacy redirects — keep old links working
    { path: 'view/:id', component: CalledDetailComponent, canActivate: [AuthGuard] },
    { path: 'history/:id', component: CalledDetailComponent, canActivate: [AuthGuard] },

    { path: 'projetos', component: ProjetosComponent, canActivate: [AuthGuard] },
    { path: 'projeto/:id', component: ProjetoDetalheComponent, canActivate: [AuthGuard] },

    { path: 'setores', component: SetoresComponent, canActivate: [AuthGuard] },
    { path: 'companies', component: CompaniesComponent, canActivate: [AuthGuard] },
    { path: 'usuarios', component: UsersComponent, canActivate: [AuthGuard] },
    { path: 'grupos-usuarios', component: UsergroupsComponent, canActivate: [AuthGuard] },
    { path: 'kb-articles', component: KbComponent, canActivate: [AuthGuard] },

    { path: 'relatorios', component: ListReportsComponent, canActivate: [AuthGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
    { path: 'cabreport', component: FormComponent, canActivate: [AuthGuard] },
    { path: 'cabreport/:id', component: FormComponent, canActivate: [AuthGuard] },

    { path: 'images', component: ImagesComponent },
];
