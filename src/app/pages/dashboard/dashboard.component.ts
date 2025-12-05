import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ProjectCompletion {
  _id: string;
  name: string;
  completionRate: number;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  activeTasks: number;
  completedTasks: number;
  teamMembers: number;
  completionRate: number;
  overallCompletionRate?: number; // optional for backward compatibility
  projectsWithCompletion?: ProjectCompletion[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats: Stats = {
    totalProjects: 0,
    activeProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    completionRate: 0,
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('Token on dashboard init:', localStorage.getItem('ph_token'));

    this.http.get<Stats>('http://localhost:5000/api/metrics').subscribe(m => {
      this.stats = {
        totalProjects: m?.totalProjects ?? 0,
        activeProjects: m?.activeProjects ?? 0,
        activeTasks: m?.activeTasks ?? 0,
        completedTasks: m?.completedTasks ?? 0,
        teamMembers: m?.teamMembers ?? 0,
        completionRate: m?.overallCompletionRate ?? m?.completionRate ?? 0,
        projectsWithCompletion: m?.projectsWithCompletion ?? [],
      };
    });
  }
}
