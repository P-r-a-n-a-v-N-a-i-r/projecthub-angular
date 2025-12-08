import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { environment } from '../../../environments/environment';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  const mockStatsResponse = {
    totalProjects: 5,
    activeProjects: 3,
    activeTasks: 15,
    completedTasks: 10,
    teamMembers: 8,
    overallCompletionRate: 66.67,
    projectsWithCompletion: [
      { _id: 'proj1', name: 'Project Alpha', completionRate: 100 },
      { _id: 'proj2', name: 'Project Beta', completionRate: 50 }
    ]
  };

  const mockStatsBackwardCompatible = {
    totalProjects: 3,
    activeProjects: 2,
    activeTasks: 8,
    completedTasks: 5,
    teamMembers: 4,
    completionRate: 62.5  // Uses legacy completionRate
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DashboardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default zero stats before API call', () => {
    expect(component.stats.totalProjects).toBe(0);
    expect(component.stats.activeProjects).toBe(0);
    expect(component.stats.completionRate).toBe(0);
    expect(component.stats.projectsWithCompletion || []).toEqual([]) // ✅ FIXED
  });

  it('should load stats successfully from API', () => {
    fixture.detectChanges(); // ✅ FIXED: triggers ngOnInit

    const req = httpMock.expectOne(`${environment.apiBase}/metrics`); // ✅ FIXED: correct URL
    expect(req.request.method).toBe('GET');
    req.flush(mockStatsResponse);

    expect(component.stats.totalProjects).toBe(5);
    expect(component.stats.activeProjects).toBe(3);
    expect(component.stats.teamMembers).toBe(8);
    expect(component.stats.completionRate).toBe(66.67);
    expect(component.stats.projectsWithCompletion!.length).toBe(2);
  });

  it('should handle backward compatible stats response', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBase}/metrics`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStatsBackwardCompatible);

    expect(component.stats.totalProjects).toBe(3);
    expect(component.stats.completionRate).toBe(62.5);
  });

  it('should use default zero values for null/undefined response', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBase}/metrics`);
    req.flush(null);

    expect(component.stats.totalProjects).toBe(0);
    expect(component.stats.activeProjects).toBe(0);
    expect(component.stats.completionRate).toBe(0);
    expect(component.stats.projectsWithCompletion).toEqual([]);
  });

  it('should use partial values with null fields', () => {
    const partialResponse = {
      totalProjects: 2,
      activeProjects: null,
      activeTasks: 7,
      completedTasks: 3,
      teamMembers: 5,
      overallCompletionRate: null
    };

    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBase}/metrics`);
    req.flush(partialResponse);

    expect(component.stats.totalProjects).toBe(2);
    expect(component.stats.activeProjects).toBe(0);
    expect(component.stats.activeTasks).toBe(7);
    expect(component.stats.completionRate).toBe(0);
  });
});
