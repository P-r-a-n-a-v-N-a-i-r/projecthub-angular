import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { TeamComponent } from './pages/team/team.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AuthComponent } from './pages/auth/auth.component';
import { TaskComponent } from './pages/task/task.component';
import { ActivityComponent } from './pages/activity/activity.component'
import { GuestGuard } from './core/guards/guest.guard';
import { LandingComponent } from './pages/landing/landing.component';
import { AuthGuard } from './core/guards/auth.guard';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';  // Import your main layout

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,  // Layout with sidebar, header
    canActivate: [AuthGuard],        // Protect these child routes
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'team', component: TeamComponent},
      { path: 'settings', component: SettingsComponent },
      { path: 'projects/:id/task', component: TaskComponent },
      { path: 'activity', component: ActivityComponent }
    ],
  },
  { path: 'auth', component: AuthComponent }, // No layout for auth pages
  { path: 'landing', component: LandingComponent },
  { path: '**', redirectTo: 'landing' }, // catch-all to main layout
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
