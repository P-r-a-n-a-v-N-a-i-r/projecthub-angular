import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly base = `${environment.apiBase}/users`;

  constructor(private http: HttpClient) {}

  updateProfile(data: { name: string; email: string }): Observable<User> {
    return this.http.put<User>(`${this.base}/me`, data);
  }

  resetPassword({ currentPassword, newPassword }: {currentPassword: string, newPassword: string}): Observable<any> {
    return this.http.post(`${this.base}/reset-password`, { currentPassword, newPassword });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.base}/me`);
  }
}
