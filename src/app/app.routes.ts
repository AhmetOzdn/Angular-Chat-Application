import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { LayoutsComponent } from './Components/layouts/layouts.component';
import { NotFoundComponent } from './Components/not-found/not-found.component';
import { userGuard } from './guards/user.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    
  },

  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    canActivate:[userGuard],
    component: LayoutsComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];
