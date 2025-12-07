import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CreateProjectModalComponent } from './create-project-modal.component';
import { ProjectService, CreateProjectDto, ProjectStatus, Project } from '../../../core/services/project.service';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';

describe('CreateProjectModalComponent', () => {
  let component: CreateProjectModalComponent;
  let fixture: ComponentFixture<CreateProjectModalComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockUsersService: jasmine.SpyObj<UsersService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  // ✅ FIXED: Complete Project mock for createProject response
  const mockCreatedProject: Project = {
    _id: 'proj1',
    name: 'Test Project',
    description: '',
    status: 'Planning' as ProjectStatus,
    startDate: '',
    endDate: '',
    members: [],
    tags: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    owner: 'user1'
  };

  const mockFullUser: any = {
    _id: 'user1',
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    projectsCount: 0,
    tasksCount: 0,
    authentication: 'email'
  };

  const mockUsers = [
    { _id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { _id: 'user2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj<ProjectService>('ProjectService', ['createProject'] as any);
    mockUsersService = jasmine.createSpyObj<UsersService>('UsersService', ['listUsers'] as any);
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['me'] as any);

    // ✅ FIXED: Return complete Project instead of {}
    mockProjectService.createProject.and.returnValue(of(mockCreatedProject));
    mockUsersService.listUsers.and.returnValue(of([mockFullUser, {
      ...mockFullUser,
      _id: 'user2',
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    }]));

    mockAuthService.currentUser$ = {
      subscribe: jasmine.createSpy('subscribe').and.callFake((cb: any) => cb(mockFullUser))
    } as any;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [CreateProjectModalComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user and users on ngOnInit', () => {
    component.ngOnInit();

    expect(mockAuthService.currentUser$.subscribe).toHaveBeenCalled();
    expect(mockUsersService.listUsers).toHaveBeenCalled();
    expect(component.currentUserId).toBe('user1');
    expect(component.users.length).toBe(1);
  });

  it('should toggle member checkbox - add', () => {
    const event = { target: { checked: true } } as any;
    
    component.onMemberToggle(event, 'user2');

    expect(component.form.controls.members.value).toEqual(['user2']);
  });

  it('should toggle member checkbox - remove', () => {
    component.form.controls.members.setValue(['user2']);
    const event = { target: { checked: false } } as any;
    
    component.onMemberToggle(event, 'user2');

    expect(component.form.controls.members.value).toEqual([]);
  });

  it('should remove member correctly', () => {
    component.form.controls.members.setValue(['user2']);
    
    component.removeMember('user2');

    expect(component.form.controls.members.value).toEqual([]);
  });

  it('should get user name by ID', () => {
    component.users = mockUsers;
    
    expect(component.getUserNameById('user2')).toBe('Jane Smith');
    expect(component.getUserNameById('user999')).toBe('user999');
  });

  it('should add tags from input', () => {
    component.form.controls.tagsInput.setValue('tag1, tag2 ,tag3');
    
    component.addTagsFromInput();

    expect(component.tags).toEqual(['tag1', 'tag2', 'tag3']);
    expect(component.form.controls.tagsInput.value).toBe('');
  });

  it('should not add tags from empty input', () => {
    component.form.controls.tagsInput.setValue('');
    
    component.addTagsFromInput();

    expect(component.tags).toEqual([]);
  });

  it('should remove tag by index', () => {
    component.tags = ['tag1', 'tag2'];
    
    component.removeTag(0);

    expect(component.tags).toEqual(['tag2']);
  });

  it('should emit false on cancel', () => {
    spyOn(component.closed, 'emit');
    
    component.cancel();

    expect(component.closed.emit).toHaveBeenCalledWith(false);
  });

  it('should not submit invalid form', () => {
    component.form.controls.name.setValue('');
    
    component.submit();

    expect(component.form.touched).toBeTruthy();
    expect(mockProjectService.createProject).not.toHaveBeenCalled();
  });

  it('should submit valid form successfully', () => {
    component.form.controls.name.setValue('Test Project');
    component.form.controls.status.setValue('Planning' as ProjectStatus);
    component.currentUserId = 'user1';

    spyOn(component.closed, 'emit');
    
    component.submit();

    expect(mockProjectService.createProject).toHaveBeenCalled();
    expect(component.closed.emit).toHaveBeenCalledWith(true);
  });

  it('should add current user to members automatically', () => {
    component.form.controls.name.setValue('Test Project');
    component.form.controls.status.setValue('Planning' as ProjectStatus);
    component.form.controls.members.setValue([]);
    component.currentUserId = 'user1';

    component.submit();

    expect(mockProjectService.createProject).toHaveBeenCalledWith(jasmine.objectContaining({
      members: jasmine.arrayContaining(['user1'])
    }));
  });

  it('should handle create project error', () => {
    mockProjectService.createProject.and.returnValue(throwError(() => new Error('Create failed')));
    component.form.controls.name.setValue('Test Project');
    component.form.controls.status.setValue('Planning' as ProjectStatus);
    component.currentUserId = 'user1';

    spyOn(component.closed, 'emit');
    
    component.submit();

    expect(component.closed.emit).not.toHaveBeenCalled();
  });
});
