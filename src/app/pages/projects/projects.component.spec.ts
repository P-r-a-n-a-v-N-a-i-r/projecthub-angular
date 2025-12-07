import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProjectsComponent } from './projects.component';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService, Project, Task } from '../../core/services/project.service';
import { UsersService } from '../../core/services/users.service';
import { Router } from '@angular/router';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockUsersService: jasmine.SpyObj<UsersService>;
  let mockRouter: jasmine.SpyObj<Router>;

  // ✅ FIXED: Complete User type for UsersService
  const mockFullUser: any = {
    _id: 'user1',
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    projectsCount: 0,
    tasksCount: 0,
    authentication: 'email'
  };

  const mockProjects: Project[] = [
    {
      _id: 'proj1',
      name: 'Project 1',
      description: 'Test project',
      status: 'Planning',
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-01-31T00:00:00Z',
      members: ['user1'],
      tags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      owner: 'user1'
    },
    {
      _id: 'proj2',
      name: 'Project 2',
      description: 'Test project',
      status: 'In Progress',
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-01-31T00:00:00Z',
      members: [],
      tags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      owner: 'user2'
    }
  ];

  // ✅ FIXED: Complete Task type
  const mockTasks: Task[] = [
    { 
      _id: 'task1', 
      status: 'done' as const, 
      title: 'Done task',
      priority: 'medium',
      description: '',
      dueDate: '',
      assignedTo: '',
      project: 'proj1'
    },
    { 
      _id: 'task2', 
      status: 'todo' as const, 
      title: 'Todo task',
      priority: 'medium',
      description: '',
      dueDate: '',
      assignedTo: '',
      project: 'proj1'
    }
  ];

  // ✅ FIXED: Simplified users for component.users property
  const mockUsers = [
    { _id: 'user1', name: 'John Doe' },
    { _id: 'user2', name: 'Jane Smith' }
  ];

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['me', 'logout']);
    mockProjectService = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'listProjects', 'listTasks'
    ]);
    mockUsersService = jasmine.createSpyObj<UsersService>('UsersService', ['listUsers']);
    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);

    // ✅ FIXED: Proper mocks for all Observables
    mockAuthService.currentUser$ = {
      subscribe: jasmine.createSpy('subscribe').and.callFake((cb: any) => cb(mockFullUser))
    } as any;

    mockProjectService.listProjects.and.returnValue(of(mockProjects));
    mockProjectService.listTasks.and.returnValue(of(mockTasks));
    // ✅ FIXED: UsersService expects full User[], component transforms to simplified
    mockUsersService.listUsers.and.returnValue(of([mockFullUser, {
      ...mockFullUser,
      _id: 'user2',
      id: 'user2',
      name: 'Jane Smith'
    }]));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ProjectsComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user, projects, and users on ngOnInit', () => {
    component.ngOnInit();

    expect(mockAuthService.currentUser$.subscribe).toHaveBeenCalled();
    expect(mockProjectService.listProjects).toHaveBeenCalled();
    expect(mockUsersService.listUsers).toHaveBeenCalled();
    expect(component.currentUserId).toBe('user1');
    expect(component.projects.length).toBe(2);
    expect(component.users.length).toBe(2);
  });

  it('should extract ID correctly', () => {
    expect(component['extractIdValue']('proj1')).toBe('proj1');
    expect(component['extractIdValue']({ $oid: 'proj1' })).toBe('proj1');
    expect(component['extractIdValue']('')).toBe('');
    expect(component['extractIdValue'](null)).toBe('');
  });

  it('should extract date correctly', () => {
    expect(component['extractDateString']('2025-01-01T00:00:00Z')).toBe('2025-01-01T00:00:00Z');
    expect(component['extractDateString']({ $date: '2025-01-01T00:00:00Z' })).toBe('2025-01-01T00:00:00Z');
    expect(component['extractDateString']('')).toBe('');
  });

  it('should navigate to task page if member', () => {
    component.currentUserId = 'user1';
    const project = mockProjects[0];

    component.onProjectClick(project);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', 'proj1', 'task']);
  });

  it('should show dialog if not member', () => {
    component.currentUserId = 'user3';
    component.users = mockUsers;
    const project = mockProjects[1];

    component.onProjectClick(project);

    expect(component.showNotMemberDialog).toBeTruthy();
    expect(component.notMemberOwnerName).toBe('Jane Smith');
  });

  it('should close dialog', () => {
    component.showNotMemberDialog = true;
    component.notMemberOwnerName = 'Test';

    component.closeDialog();

    expect(component.showNotMemberDialog).toBeFalsy();
    expect(component.notMemberOwnerName).toBe('');
  });

  it('should get owner name correctly', () => {
    component.users = mockUsers;
    
    expect(component.getOwnerNameById('user1')).toBe('John Doe');
    expect(component.getOwnerNameById('user999')).toBe('Unknown User');
  });

  it('should return correct status classes', () => {
    expect(component.getStatusClasses('planning')).toContain('bg-violet-50');
    expect(component.getStatusClasses('completed')).toContain('bg-blue-50');
    expect(component.getStatusClasses('')).toContain('bg-green-50');
  });

  it('should load task stats for projects', () => {
    component.projects = mockProjects;

    component['loadTaskStatsForAllProjects']();

    expect(mockProjectService.listTasks).toHaveBeenCalledTimes(2);
    expect(component.projectStats['proj1']).toEqual({ total: 2, done: 1 });
  });
});
