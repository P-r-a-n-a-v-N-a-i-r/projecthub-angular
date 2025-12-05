import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../core/services/users.service';

export interface User {
  id: string;
  name: string;
  email: string;
  projectsCount: number;
  tasksCount: number;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html'
})
export class TeamComponent implements OnInit {
  users: User[] = [];
  showInviteModal = false;
  inviteEmail = '';
  inviteLoading = false;
  inviteError = '';
  inviteSuccess = '';

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.usersService.listUsers().subscribe(users => this.users = users);
  }

  getUserInitials(name: string): string {
    if (!name) return '';
    const split = name.trim().split(' ');
    if (split.length === 1) {
      return split[0][0].toUpperCase();
    }
    return (split[0][0] + split[1][0]).toUpperCase();
  }

  openInviteModal() {
    this.showInviteModal = true;
    this.inviteEmail = '';
    this.inviteError = '';
    this.inviteSuccess = '';
  }

  closeInviteModal() {
    this.showInviteModal = false;
    this.inviteError = '';
    this.inviteSuccess = '';
    this.inviteLoading = false;
    this.inviteEmail = '';
  }

  sendInvitation() {
    if (!this.inviteEmail) {
      this.inviteError = 'Email is required';
      return;
    }
    this.inviteLoading = true;
    this.inviteError = '';
    this.inviteSuccess = '';
    this.usersService.inviteMember(this.inviteEmail).subscribe({
      next: (res) => {
        this.inviteSuccess = 'Invitation sent!';
        this.inviteLoading = false;
        setTimeout(() => this.closeInviteModal(), 1200);
      },
      error: (err) => {
        this.inviteError = err?.error?.message || 'Failed to send invite';
        this.inviteLoading = false;
      }
    });
  }
}
