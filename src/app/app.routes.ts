import { Routes } from '@angular/router';
import { GraphComponent } from './components/fluxo/graph/graph.component';
import { LoginGuard } from './components/core/auth/login.guard';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './components/core/auth/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { CalledViewComponent } from './components/called-view/called-view.component';
import { CalledDetailsComponent } from './components/called-details/called-details.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { CompaniesComponent } from './components/companies/companies.component';

export const routes: Routes = [
    {
        path: "",
        component: LoginComponent,
        canActivate: [LoginGuard]
    },
    {
        path: "inicio",
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "view",
        component: CalledViewComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "view/:id",
        component: CalledViewComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "history/:id",
        component: CalledDetailsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "departments",
        component: DepartmentsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "companies",
        component: CompaniesComponent,
        canActivate: [AuthGuard]
    },

];
