import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';

export interface CreateProjectDto {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  members?: string[];
  tags?: string[];
}

export interface Project extends CreateProjectDto {
  _id: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
}

export type TaskStatus = 'todo' | 'in progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface UserReference {
  _id: string;
  name?: string;
  email?: string;
}

export interface Task {
  _id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | UserReference;
  project: string;
  dueDate?: string;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private base = `${environment.apiBase}/projects`;
  private taskBase = `${environment.apiBase}/tasks`;

  constructor(private http: HttpClient) {}

  listProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.base);
  }

  createProject(body: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.base, body);
  }

  updateProject(projectId: string, data: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.base}/${projectId}`, data);
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.base}/${id}`);
  }

  deleteProject(projectId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${projectId}`);
  }

  // Task APIs (within ProjectService for convenience)
  listTasks(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.taskBase}/project/${projectId}`);
  }

  createTask(projectId: string, task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    return this.http.post<Task>(`${this.taskBase}/project/${projectId}`, task);
  }

  updateTask(taskId: string, data: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.taskBase}/${taskId}`, data);
  }

  deleteTask(taskId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.taskBase}/${taskId}`);
  }
}
