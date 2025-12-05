import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  showTooltip = false;
  userName: string | null = null;
  userInitials: string = '';
  userEmail: string | null = null;
  isAuthed = false;
  private userSubscription?: Subscription;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to user auth state changes for reactive UI updates
    this.userSubscription = this.auth.currentUser$.subscribe((user: User | null) => {
      this.userName = user?.name ?? null;
      this.userEmail = user?.email ?? null;
      this.userInitials = this.getUserInitials(user?.name);
      this.isAuthed = !!user;
    });

    // On component init, verify auth token and redirect accordingly
    if (this.auth.isAuthenticated()) {
      this.auth.me().subscribe({
        next: user => {
          return true;
        },
        error: () => {
          this.handleLogout(); // Clear and redirect on error
        }
      });
    } else {
      this.handleLogout();
    }
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  signOut() {
    this.handleLogout();
  }

  private handleLogout() {
    this.auth.logout();
    this.clearUserState();
    this.router.navigateByUrl('/auth');
  }

  private clearUserState() {
    this.userName = null;
    this.userEmail = null;
    this.userInitials = '';
    this.isAuthed = false;
  }

  // Generate user initials: first letters of first two words or single letter
  private getUserInitials(name?: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  }
}
