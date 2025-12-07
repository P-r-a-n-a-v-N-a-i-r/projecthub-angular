import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'projecthub'; 
  constructor(private auth: AuthService, private router: Router) {}

  get isAuthed(): boolean {
    return this.auth.isAuthenticated();
  }

  signOut() {
    this.auth.logout();
    this.router.navigateByUrl('/auth');
  }
}
