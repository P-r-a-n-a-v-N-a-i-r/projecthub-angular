import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProjectService, CreateProjectDto, ProjectStatus } from '../../../core/services/project.service';
import { UsersService } from '../../../core/services/users.service';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-project-modal',
  templateUrl: './create-project-modal.component.html'
})
export class CreateProjectModalComponent implements OnInit {
  @Output() closed = new EventEmitter<boolean>();

  submitting = false; // Flag indicating if form submission is in progress
  tags: string[] = []; // Tags array for the project
  statuses: ProjectStatus[] = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']; // Possible statuses for the project

  // Reactive form initialization with form controls and validators
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    status: ['Planning' as ProjectStatus, Validators.required],
    startDate: [''],
    endDate: [''],
    members: [[] as string[]], // Holds selected member IDs
    tagsInput: ['']
  });

  users: { _id: string; name: string; email: string }[] = []; // List of users available for member selection
  currentUserId: string = ''; // ID of the current logged-in user

  constructor(
    private fb: FormBuilder,
    private projects: ProjectService,
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to currentUser$ to get current user info and ID
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUserId = user?._id || '';

      // Fetch list of users and filter out the current user from the members list
      this.usersService.listUsers().subscribe((rawUsers: any[]) => {
        this.users = rawUsers
          .map(u => ({
            _id: u.id.toString ? u.id.toString() : u.id, // Map id to _id
            name: u.name,
            email: u.email
          }))
          .filter(u => u._id !== this.currentUserId);
      });
    });
  }

  // Getter for current selected member IDs
  get members(): string[] {
    return this.form.controls.members.value || [];
  }

  // Handler for checkbox toggle for member selection
  onMemberToggle(event: Event, memberId: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const currentMembers = this.members;
    if (checked) {
      if (!currentMembers.includes(memberId)) {
        currentMembers.push(memberId);
      }
    } else {
      const index = currentMembers.indexOf(memberId);
      if (index >= 0) {
        currentMembers.splice(index, 1);
      }
    }
    // Update form control with new members array (copy to trigger change detection)
    this.form.controls.members.setValue([...currentMembers]);
  }

  // Remove a member from the selected list (from preview tags)
  removeMember(memberId: string) {
    const currentMembers = this.members;
    const idx = currentMembers.indexOf(memberId);
    if (idx >= 0) {
      currentMembers.splice(idx, 1);
      this.form.controls.members.setValue([...currentMembers]);
    }
  }

  // Helper to get user's name given user ID
  getUserNameById(id: string): string {
    const user = this.users.find(u => u._id === id);
    return user ? user.name : id;
  }

  // Add tags parsed from tagsInput control; splits on commas
  addTagsFromInput() {
    const raw = (this.form.value.tagsInput || '') as string;
    if (!raw.trim()) return;
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (!this.tags.includes(p)) this.tags.push(p);
    }
    this.form.patchValue({ tagsInput: '' });
  }

  // Remove tag at index i
  removeTag(i: number) {
    this.tags.splice(i, 1);
  }

  // Cancel creating project and emit close event
  cancel() {
    this.closed.emit(false);
  }

  // Submit the form, call createProject on ProjectService with payload
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
  
    // Start with members selected in form or empty array
    let members = v.members && v.members.length ? [...v.members] : [];
  
    // Add current user/owner ID to members if not already included
    if (this.currentUserId && !members.includes(this.currentUserId)) {
      members.push(this.currentUserId);
    }
  
    const payload: CreateProjectDto = {
      name: v.name!,
      description: v.description || undefined,
      status: v.status!,
      startDate: v.startDate || undefined,
      endDate: v.endDate || undefined,
      members: members.length > 0 ? members : undefined,
      tags: this.tags.length > 0 ? this.tags : undefined
    };
  
    this.submitting = true;
    this.projects.createProject(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.closed.emit(true);
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
  
}
