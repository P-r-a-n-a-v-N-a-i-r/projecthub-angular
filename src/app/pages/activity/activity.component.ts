import { Component, OnInit } from '@angular/core';
import { ActivityService, Activity } from '../../core/services/activity.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
})
export class ActivityComponent implements OnInit {
  loading = false;
  activities: Activity[] = [];
  error = '';

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.fetchActivity();
  }

  fetchActivity() {
    this.loading = true;
    this.activityService.getAll().subscribe({
      next: (data) => {
        this.activities = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load activity log.';
        this.loading = false;
      }
    });
  }

  getActivityIcon(activity: any): string {
    if (!activity || !activity.type || !activity.action) return 'activity';
  
    const type = activity.type.toLowerCase();
    const action = activity.action.toLowerCase();
  
    if (type === 'project') {
      switch (action) {
        case 'created': return 'folder-plus';
        case 'updated': return 'folder';
        case 'deleted': return 'folder-minus';
      }
    } else if (type === 'task') {
      switch (action) {
        case 'created': return 'check-circle';
        case 'updated': return 'edit';
        case 'deleted': return 'trash-2';
      }
    }
    // Default fallback icon
    return 'activity';
  }
  
}
