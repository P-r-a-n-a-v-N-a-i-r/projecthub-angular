import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project, Task, TaskStatus } from '../../core/services/project.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
})
export class TaskComponent implements OnInit {
  currentUserId: string = '';

  statuses = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

  project: Project = {
    _id: '',
    name: '',
    description: '',
    status: 'Planning',
    startDate: '',
    endDate: '',
    members: [],
    tags: [],
    createdAt: '',
    updatedAt: '',
    owner: '',
  };

  tasks: Task[] = [];
  showCreateTask = false;
  loadingTasks = false;
  errorMessage = '';
  activeTab: 'tasks' | 'team' = 'tasks';

  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  taskTitle = '';
  taskDescription = '';
  taskStatus: TaskStatus = 'todo';
  taskPriority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  taskDeadline: string = '';
  taskAssignee: string = '';
  adding = false;

  selectedTask: Task | null = null;
  showTaskModal = false;

  showSettingsModal = false;

  completionPercentage = 0;

  users: { _id: string; name: string; email: string }[] = [];
  newMemberId = '';
  addingMember = false;
  memberError = '';
  showAddMemberModal = false;

  showDeleteMemberModal = false;
  memberToDelete: string | null = null;

  showDeleteProjectConfirm = false;

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  conflictWarning: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private usersService: UsersService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      this.errorMessage = 'Project ID is required';
      return;
    }
    this.authService.me().subscribe(user => {
      this.currentUserId = user._id;
      this.loadProject(projectId);
      this.loadTasks(projectId);
      this.loadUsers();
    }, err => {
      console.error('Failed to load current user');
      this.loadProject(projectId);
      this.loadTasks(projectId);
      this.loadUsers();
    });
  }

  loadProject(id: string) {
    this.projectService.getProject(id).subscribe({
      next: proj => {
        this.project = proj;

        // Convert ISO datetime strings to yyyy-MM-dd format for date inputs
        this.project.startDate = proj.startDate ? this.formatDateToInput(proj.startDate) : '';
        this.project.endDate = proj.endDate ? this.formatDateToInput(proj.endDate) : '';
      },
      error: () => (this.errorMessage = 'Failed to load project details'),
    });
  }

  formatDateToInput(dateString: string): string {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }


  formatDateForInput(dateStr: string | Date): string {
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  loadTasks(projectId: string) {
    this.loadingTasks = true;
    this.projectService.listTasks(projectId).subscribe({
      next: tasks => {
        this.tasks = tasks;
        this.todoTasks = tasks.filter(t => t.status === 'todo');
        this.inProgressTasks = tasks.filter(t => t.status === 'in progress');
        this.doneTasks = tasks.filter(t => t.status === 'done');
        this.loadingTasks = false;
        this.calculateCompletion();
      },
      error: () => {
        this.errorMessage = 'Failed to load tasks';
        this.loadingTasks = false;
      },
    });
  }

  calculateCompletion() {
    if (this.tasks.length === 0) {
      this.completionPercentage = 0;
      return;
    }
    const completedTasks = this.doneTasks.length;
    this.completionPercentage = Math.round((completedTasks / this.tasks.length) * 100);
  }

  addTask() {
    if (!this.project?._id || !this.taskTitle) return;
    this.adding = true;
    this.projectService.createTask(this.project._id, {
      title: this.taskTitle,
      description: this.taskDescription,
      status: this.taskStatus,
      priority: this.taskPriority,
      dueDate: this.taskDeadline,
      assignedTo: this.taskAssignee,
      project: this.project._id,
    }).subscribe({
      next: () => {
        this.showCreateTask = false;
        this.taskTitle = '';
        this.taskDescription = '';
        this.taskStatus = 'todo';
        this.taskPriority = 'medium';
        this.taskDeadline = '';
        this.taskAssignee = '';
        this.adding = false;
        this.loadTasks(this.project!._id);
      },
      error: () => {
        this.adding = false;
        alert('Failed to add task');
      }
    });
  }

  onAssigneeOrDeadlineChange() {
    this.conflictWarning = '';
    if (!this.taskAssignee || !this.taskDeadline) return;
    console.log("taskAssignee ", this.taskAssignee, "taskDeadline ", this.taskDeadline);
    console.log("tasks ", this.tasks);
  
    // Filter tasks where assignedTo._id matches taskAssignee and dueDate matches taskDeadline (ignoring time)
    const conflicts = this.tasks?.filter(task => {
      const assignedUserId =
        task.assignedTo && typeof task.assignedTo === 'object'
          ? task.assignedTo._id
          : task.assignedTo;
    
      if (!assignedUserId) return false;
      if (assignedUserId !== this.taskAssignee) return false;
    
      const taskDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null;
      const selectedDeadline = new Date(this.taskDeadline).toISOString().split('T')[0];
      return taskDueDate === selectedDeadline;
    }) || [];
  
    if (conflicts.length) {
      const assigneeName = this.getUserById(this.taskAssignee)?.name || this.taskAssignee;
      this.conflictWarning = `⚠️ ${assigneeName} is already assigned to another task on this date.`;
    }
  }
  


  openTaskModal(task: Task) {
    this.selectedTask = { ...task };
    console.log("openTaskModel", this.selectedTask)
    this.showTaskModal = true;
  }

  getAssigneeName(assignedTo: any): string {
    if (!assignedTo) return '-';
    if (typeof assignedTo === 'object') {
      return assignedTo.name || '-';
    } else if (typeof assignedTo === 'string') {
      const user = this.getUserById(assignedTo);
      return user?.name || assignedTo;
    }
    return '-';
  }
  

  changeTaskStatus(newStatus: TaskStatus) {
    if (!this.selectedTask) return;
    this.projectService.updateTask(this.selectedTask._id!, { status: newStatus }).subscribe({
      next: updated => {
        this.selectedTask!.status = newStatus;
        this.loadTasks(this.project!._id);
      }
    });
  }

  deleteTask() {
    if (!this.selectedTask) return;
    if (!confirm('Are you sure you want to delete this task?')) return;
    this.projectService.deleteTask(this.selectedTask._id!).subscribe({
      next: () => {
        this.showTaskModal = false;
        this.loadTasks(this.project!._id);
      }
    });
  }

  loadUsers() {
    this.usersService.listUsers().subscribe({
      next: users => {
        this.users = users.map(u => ({
          _id: u.id ?? '',
          name: u.name ?? '',
          email: u.email ?? ''
        }));
      },
      error: () => {
        console.error('Failed to load users');
      }
    });
  }

  addMember() {
    this.memberError = '';
    if (!this.newMemberId) {
      this.memberError = 'Please select a user';
      return;
    }
    if (!this.project) {
      this.memberError = 'Project not loaded';
      return;
    }
    this.addingMember = true;

    const updatedMembers = Array.isArray(this.project.members) ? [...this.project.members] : [];
    if (!updatedMembers.includes(this.newMemberId)) {
      updatedMembers.push(this.newMemberId);
    }

    this.projectService.updateProject(this.project._id, { members: updatedMembers }).subscribe({
      next: updatedProject => {
        this.project = updatedProject;
        this.newMemberId = '';
        this.addingMember = false;
      },
      error: err => {
        this.memberError = err?.error?.message || 'Failed to add member';
        this.addingMember = false;
      }
    });
  }

  getUserById(id: string): { _id: string; name: string; email: string } | undefined {
    return this.users.find(u => u._id === id);
  }

  openDeleteMemberModal(memberId: string) {
    this.memberToDelete = memberId;
    this.showDeleteMemberModal = true;
  }

  confirmDeleteMember() {
    if (!this.memberToDelete || !this.project) return;

    const updatedMembers = (this.project.members ?? []).filter(m => m !== this.memberToDelete);

    this.projectService.updateProject(this.project._id, { members: updatedMembers }).subscribe({
      next: updatedProject => {
        this.project = updatedProject;
        this.showDeleteMemberModal = false;
        this.memberToDelete = null;
      },
      error: () => {
        alert('Failed to remove member');
        this.showDeleteMemberModal = false;
        this.memberToDelete = null;
      }
    });
  }

  cancelDeleteMember() {
    this.showDeleteMemberModal = false;
    this.memberToDelete = null;
  }

  saveProjectSettings() {
    if (!this.project) return;

    const updatePayload = {
      ...this.project,
    };

    this.projectService.updateProject(this.project._id, updatePayload).subscribe({
      next: updated => {
        this.project = updated;
        this.showSettingsModal = false;
        this.showToastMessage('Project Details Updated successfully.', 'success');
      },
      error: () => {
        this.showToastMessage('Failed to update project settings.', 'error');
      }
    });
  }

  openDeleteProjectConfirm() {
    this.showDeleteProjectConfirm = true;
  }

  confirmDeleteProject() {
    if (!this.project) return;

    this.projectService.deleteProject(this.project._id).subscribe({
      next: () => {
        this.showSettingsModal = false;
        this.showDeleteProjectConfirm = false;
        this.showToastMessage('Project deleted successfully.', 'success');
        this.router.navigate(['/projects']); // or your desired route
      },
      error: () => {
        this.showDeleteProjectConfirm = false;
        this.showToastMessage('Failed to delete project.', 'error');
      }
    });
  }

  cancelDeleteProject() {
    this.showDeleteProjectConfirm = false;
  }


  getPriorityClass(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'critical':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  }

  showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000); // hide after 3 seconds
  }
}
