import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivityComponent } from './activity.component';
import { ActivityService, Activity } from '../../core/services/activity.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
  let activityServiceMock: jasmine.SpyObj<ActivityService>;

  const mockActivities: Activity[] = [
  { type: 'project', action: 'created' } as Activity & { description: string },
  { type: 'task', action: 'deleted' } as Activity & { description: string }
];

  beforeEach(async () => {
    activityServiceMock = jasmine.createSpyObj('ActivityService', ['getAll']);
    activityServiceMock.getAll.and.returnValue(of(mockActivities));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ActivityComponent],
      providers: [
        { provide: ActivityService, useValue: activityServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch activities on init', () => {
    expect(component.loading).toBeFalse();
    expect(component.activities.length).toBe(2);
    expect(component.activities).toEqual(mockActivities);
  });

  it('should handle error from service', fakeAsync(() => {
    activityServiceMock.getAll.and.returnValue(throwError(() => new Error('Failed')));
    component.fetchActivity();
    tick();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Failed to load activity log.');
  }));

  it('should return correct activity icon', () => {
    expect(component.getActivityIcon({ type: 'project', action: 'created' })).toBe('folder-plus');
    expect(component.getActivityIcon({ type: 'task', action: 'deleted' })).toBe('trash-2');
    expect(component.getActivityIcon({ type: 'unknown', action: 'other' })).toBe('activity');
    expect(component.getActivityIcon(null)).toBe('activity');
  });
});
