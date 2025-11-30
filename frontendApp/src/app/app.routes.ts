import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { UserComponent } from './user/user';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'user', component: UserComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];