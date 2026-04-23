import { Routes } from '@angular/router';
import { GraphComponent } from './components/fluxo/graph/graph.component';
import { LoginGuard } from './components/core/auth/login.guard';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './components/core/auth/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { CalledDetailComponent } from './components/called-detail/called-detail.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { UsersComponent } from './components/users/users.component';
import { ListReportsComponent } from './components/reports/list-reports/list-reports.component';
import { FormComponent } from './components/reports/form/form.component';
import { ReportsComponent } from './components/reports/reports/reports.component';
import { ImagesComponent } from './components/images/images.component';

export const routes: Routes = [
    { path: '', component: LoginComponent, canActivate: [LoginGuard] },

    { path: 'inicio', component: HomeComponent, canActivate: [AuthGuard] },

    // Unified ticket detail (view + history + new comment)
    { path: 'chamado/:id', component: CalledDetailComponent, canActivate: [AuthGuard] },
    // Legacy redirects — keep old links working
    { path: 'view/:id', component: CalledDetailComponent, canActivate: [AuthGuard] },
    { path: 'history/:id', component: CalledDetailComponent, canActivate: [AuthGuard] },

    { path: 'departments', component: DepartmentsComponent, canActivate: [AuthGuard] },
    { path: 'companies', component: CompaniesComponent, canActivate: [AuthGuard] },
    { path: 'usuarios', component: UsersComponent, canActivate: [AuthGuard] },

    { path: 'relatorios', component: ListReportsComponent, canActivate: [AuthGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
    { path: 'cabreport', component: FormComponent, canActivate: [AuthGuard] },
    { path: 'cabreport/:id', component: FormComponent, canActivate: [AuthGuard] },

    { path: 'images', component: ImagesComponent },
];
