import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProjectService, Project } from '../../core/services/project.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  showResetPasswordForm = false;
  userInitials = '';

  profileForm = this.fb.group({
    name: ['', Validators.required],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]]
  });

  profileError = '';
  profileSuccess = '';
  resetSuccess = '';
  resetError = '';
  deleteError = '';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordMismatch = false;

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  // Delete dialog controls
  showDeleteDialog = false;
  ownedProjects: Project[] = []; // to hold projects owned by current user

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private settings: SettingsService,
    private projectsService: ProjectService
  ) { }

  ngOnInit() {
    this.auth.me().subscribe({
      next: (user) => {
        this.user = user;
        this.showResetPasswordForm = user.authentication === "email";
        this.userInitials = this.getUserInitials(user?.name);
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      }
    });
  }

  getUserInitials(name?: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    this.profileError = '';
    this.profileSuccess = '';
    const raw = this.profileForm.getRawValue();
    const data = {
      name: raw.name ?? '',
      email: raw.email ?? ''
    };
    this.settings.updateProfile(data).subscribe({
      next: (user) => {
        this.profileSuccess = 'Profile updated!';
        this.user = user;
        this.userInitials = this.getUserInitials(user.name);
        this.auth.currentUser$.next(user);
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      },
      error: err => {
        this.profileError = err?.error?.message || 'Failed to update profile';
      }
    });
  }

  resetPassword() {
    this.passwordMismatch = this.newPassword !== this.confirmNewPassword;
    if (this.passwordMismatch) {
      this.showToastMessage('Password Mismatch', 'error');
      return;
    }

    this.settings.resetPassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => this.showToastMessage('Password reset successfully.', 'success'),
      error: (err) => this.showToastMessage((err.error?.message || err.message), 'error')
    });
  }

  // Load projects owned by current user before showing delete dialog
  openDeleteDialog() {
    this.showDeleteDialog = true;
    if (!this.user) {
      this.ownedProjects = [];
      return;
    }
    this.projectsService.listProjects().subscribe(projects => {
      // Filter projects where owner matches current user id
      this.ownedProjects = projects.filter(p => p.owner === this.user?._id);
    });
  }

  closeDeleteDialog() {
    this.showDeleteDialog = false;
  }



  confirmDeleteAccount() {
    if (this.ownedProjects.length === 0) {
      // No owned projects, just delete account
      this.deleteAccount();
      return;
    }

    // Delete all owned projects API calls
    const deleteCalls = this.ownedProjects.map(project =>
      this.projectsService.deleteProject(project._id)
    );

    forkJoin(deleteCalls).subscribe({
      next: () => {
        // After deleting projects, delete user account
        this.deleteAccount();
      },
      error: (err) => {
        this.showToastMessage('Failed to delete projects before account deletion', 'error');
        this.showDeleteDialog = false;
      }
    });
  }


  deleteAccount() {
    this.deleteError = '';
    this.settings.deleteAccount().subscribe({
      next: () => {
        this.auth.logout();
        window.location.href = '/auth';
      },
      error: err => {
        this.deleteError = err?.error?.message || 'Error deleting account';
      }
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
}
