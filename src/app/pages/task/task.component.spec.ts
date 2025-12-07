import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TaskComponent } from './task.component';
import { ProjectService, Project, Task, TaskStatus } from '../../core/services/project.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockUsersService: jasmine.SpyObj<UsersService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProject: Project = {
    _id: '1',
    name: 'Test Project',
    description: 'Test Description',
    status: 'Planning',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-01-31T00:00:00Z',
    members: [],
    tags: [],
    createdAt: '',
    updatedAt: '',
    owner: 'user1'
  };

  const mockTasks: Task[] = [
    {
      _id: 'task1',
      title: 'Test Task',
      description: '',
      status: 'todo' as TaskStatus,
      priority: 'medium',
      dueDate: '2025-12-15T00:00:00Z',
      assignedTo: 'user1',
      project: '1'
    }
  ];

  // ✅ FIXED: any[] bypasses ALL type conflicts
  const mockUser: any = {
    _id: 'user1',
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockUsersList: any[] = [  // ✅ any[] works for BOTH services
    {
      _id: 'user1',
      id: 'user1',        // AuthService.User
      name: 'Test User',
      email: 'test@example.com',
      projectsCount: 0,
      tasksCount: 0,
      authentication: 'email'
    },
    {
      _id: 'user2',
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      projectsCount: 0,
      tasksCount: 0,
      authentication: 'email'
    }
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getProject', 'listTasks'
    ] as any);

    mockUsersService = jasmine.createSpyObj<UsersService>('UsersService', ['listUsers'] as any);
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['me'] as any);
    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate'] as any);

    // ✅ FIXED: any[] works perfectly for both services
    mockAuthService.me.and.returnValue(of(mockUser));
    mockProjectService.getProject.and.returnValue(of(mockProject));
    mockProjectService.listTasks.and.returnValue(of(mockTasks));
    mockUsersService.listUsers.and.returnValue(of(mockUsersList));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [TaskComponent],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { snapshot: { paramMap: new Map([['id', '1']]) } }
        },
        { provide: Router, useValue: mockRouter },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load everything on ngOnInit', () => {
    component.ngOnInit();

    expect(mockAuthService.me).toHaveBeenCalled();
    expect(mockProjectService.getProject).toHaveBeenCalledWith('1');
    expect(mockProjectService.listTasks).toHaveBeenCalledWith('1');
    expect(mockUsersService.listUsers).toHaveBeenCalled();
    expect(component.project._id).toBe('1');
    expect(component.tasks.length).toBe(1);
  });

  it('should handle auth failure', () => {
    mockAuthService.me.and.returnValue(throwError(() => new Error('Auth failed')));
    
    component.ngOnInit();

    expect(mockProjectService.getProject).toHaveBeenCalledWith('1');
  });

  it('should categorize tasks', () => {
    component.loadTasks('1');
    expect(component.todoTasks.length).toBe(1);
  });

  it('should calculate completion', () => {
    component.tasks = mockTasks;
    component.calculateCompletion();
    expect(component.completionPercentage).toBe(0);
  });

  it('should format dates', () => {
    const result = (component as any).formatDateToInput('2025-01-15T10:00:00Z');
    expect(result).toBe('2025-01-15');
  });

  it('should get assignee name', () => {
    component.users = [{ _id: 'user1', name: 'Test User', email: '' }];
    expect(component.getAssigneeName('user1')).toBe('Test User');
  });

  it('should detect conflicts', () => {
    component.users = [{ _id: 'user1', name: 'Test User', email: '' }];
    component.tasks = [{ assignedTo: { _id: 'user1' }, dueDate: '2025-12-15T00:00:00Z' } as Task];
    component.taskAssignee = 'user1';
    component.taskDeadline = '2025-12-15';
    
    component.onAssigneeOrDeadlineChange();
    expect(component.conflictWarning).toContain('Test User');
  });
});
