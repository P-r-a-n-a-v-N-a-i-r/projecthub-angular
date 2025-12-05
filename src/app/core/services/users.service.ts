import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  projectsCount: number;
  tasksCount: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private baseUrl = `${environment.apiBase}/users`;

  constructor(private http: HttpClient) {}

  listUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/allUsers`);
  }

  inviteMember(email: string) {
    return this.http.post(`${this.baseUrl}/invite`, { email });
  }
  

  // You can extend with more methods as needed (add, invite, remove, etc.)
}
