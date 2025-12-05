import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Activity {
  _id: string;
  type: string;         // e.g., "project", "task"
  action: string;       // e.g., "created", "updated", "deleted"
  targetType: string;   // "project" or "task"
  targetName: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  icon?: string;        // for easier icon selection in UI
}

@Injectable({ providedIn: 'root' })
export class ActivityService {

  private base = `${environment.apiBase}/activity`; 

  constructor(private http: HttpClient) {}
  
  getAll(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.base);
  }
}
