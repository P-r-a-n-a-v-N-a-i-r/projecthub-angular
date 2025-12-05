import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService, Project } from '../../core/services/project.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  showCreate = false;
  projects: Project[] = [];
  users: { _id: string; name: string }[] = [];  // add users property
  loading = false;
  activeTab: 'tasks' | 'team' = 'tasks';

  showNotMemberDialog = false;
notMemberOwnerName = '';

currentUserId = ''; 

projectStats: { [projectId: string]: { total: number; done: number } } = {};

  constructor(
    private authService: AuthService,
    private projectsApi: ProjectService,
    private usersService: UsersService,  // import UsersService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUserId = user?._id || '';
    });
    this.loadProjects();
    this.loadUsers();   // load users for owner name lookup
  }

  // call this on click instead of directly openTaskPage()
onProjectClick(project: Project) {
  const isMember = project.members?.includes(this.currentUserId);
  if (isMember) {
    this.openTaskPage(project._id);
  } else {
    this.notMemberOwnerName = this.getOwnerNameById(project.owner);
    this.showNotMemberDialog = true;
  }
}

closeDialog() {
  this.showNotMemberDialog = false;
  this.notMemberOwnerName = '';
}

  loadUsers() {
    this.usersService.listUsers().subscribe(rawUsers => {
      this.users = rawUsers.map((u:any) => ({
        _id: u.id.toString ? u.id.toString() : u.id,
        name: u.name
      }));
    });
  }

  extractIdValue(idField: any): string {
    if (!idField) return '';
    if (typeof idField === 'string') return idField;
    if (idField.$oid) return idField.$oid;
    return '';
  }

  extractDateString(dateField: any): string {
    if (!dateField) return '';
    if (typeof dateField === 'string') return dateField;
    if (dateField.$date) return dateField.$date;
    return '';
  }

  loadProjects() {
    this.loading = true;
    this.projectsApi.listProjects().subscribe({
      next: (items) => {
        this.projects = items.map(p => ({
          ...p,
          _id: this.extractIdValue(p._id),
          startDate: this.extractDateString(p.startDate),
          endDate: this.extractDateString(p.endDate),
          createdAt: this.extractDateString(p.createdAt),
          updatedAt: this.extractDateString(p.updatedAt),
          owner: this.extractIdValue(p.owner),
        }));
        this.loading = false;
        this.loadTaskStatsForAllProjects();
      },
      error: () => { this.loading = false; },
    });
  }

  loadTaskStatsForAllProjects() {
    this.projects.forEach(project => {
      this.projectsApi.listTasks(project._id).subscribe({
        next: (tasks) => {
          const total = tasks.length;
          const done = tasks.filter(t => t.status === 'done').length;
          this.projectStats[project._id] = { total, done };
        }
      });
    });
  }


  getOwnerNameById(ownerId: string): string {
    const user = this.users.find(u => u._id === ownerId);
    return user ? user.name : 'Unknown User';
  }
  

  getStatusClasses(status: string) {
    switch ((status || 'in progress').toLowerCase()) {
      case 'planning':   return 'bg-violet-50 text-violet-700 ring-violet-200';
      case 'completed':  return 'bg-blue-50 text-blue-700 ring-blue-200';
      case 'on hold':    return 'bg-yellow-50 text-yellow-700 ring-yellow-200';
      case 'cancelled':  return 'bg-red-50 text-red-700 ring-red-200';
      case 'in progress':
      default:           return 'bg-green-50 text-green-700 ring-green-200';
    }
  }

  openTaskPage(id: string) {
    this.router.navigate(['/projects', id, 'task']);
  }

  openCreate() {
    this.showCreate = true;
  }

  onClosed(created: boolean) {
    this.showCreate = false;
    if (created) this.loadProjects();
  }
}
