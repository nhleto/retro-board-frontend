import { Routes } from '@angular/router';
import { HomeComponent } from './app/components/home/home.component';
import { groupGuard } from './app/auth/group.guard';
import { WelcomeComponent } from './app/components/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
  },
  {
    path: 'group/:id',
    canActivate: [groupGuard],
    component: HomeComponent,
  },
  { path: 'index', component: WelcomeComponent },
];
