import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Feature Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { CreateProjectModalComponent } from './pages/projects/create-project-modal/create-project-modal.component';
import { AuthComponent } from './pages/auth/auth.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LandingComponent } from './pages/landing/landing.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TeamComponent } from './pages/team/team.component';

// Core Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Lucide Icons
import { LucideAngularModule, House, Folder, CheckSquare, Activity, Users, Settings, Bell, User, Plus, UserPlus, Calendar, Mail,Edit, Trash2, CheckCircle, FolderPlus, FolderMinus } from 'lucide-angular';
import { TaskComponent } from './pages/task/task.component';
import { ActivityComponent } from './pages/activity/activity.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ProjectsComponent,
    CreateProjectModalComponent,
    AuthComponent,
    MainLayoutComponent,
    LandingComponent,
    SettingsComponent,
    TeamComponent,
    TaskComponent,
    ActivityComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }), // for Angular Universal
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule.pick({
      House,
      Folder,
      CheckSquare,
      Activity,
      Users,
      Settings,
      Bell,
      User,
      Plus,
      UserPlus,
      Calendar,
      Mail,Edit, Trash2, CheckCircle, FolderPlus, FolderMinus
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
