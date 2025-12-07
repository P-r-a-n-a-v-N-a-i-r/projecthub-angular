import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TaskComponent } from './task.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProjectService, Task, Project } from '../../core/services/project.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let projectServiceMock: any;
  let usersServiceMock: any;
  let authServiceMock: any;

  // Mock Task
  const mockTask: Task = {
    _id: 't1',
    title: 'Task 1',
    description: 'Test task',
    status: 'todo',
    priority: 'medium',
    assignedTo: { _id: 'u1', name: 'User 1', email: 'u1@test.com' },
    project: '1',
    dueDate: '2025-12-07',
    createdAt: '2025-12-01',
    updatedAt: '2025-12-01',
  };

  // Mock Project
  const mockProject: Project = {
    _id: '1',
    name: 'Test Project',
    description: 'Project description',
    status: 'Planning',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    members: [],
    tags: [],
    createdAt: '2025-12-01',
    updatedAt: '2025-12-01',
    owner: 'owner1'
  };

  beforeEach(async () => {
    projectServiceMock = {
      getProject: jasmine.createSpy('getProject').and.returnValue(of(mockProject)),
      listTasks: jasmine.createSpy('listTasks').and.returnValue(of([mockTask])),
      createTask: jasmine.createSpy('createTask').and.returnValue(of(mockTask)),
      updateTask: jasmine.createSpy('updateTask').and.returnValue(of(mockTask)),
      deleteTask: jasmine.createSpy('deleteTask').and.returnValue(of({ message: 'Deleted' })),
      updateProject: jasmine.createSpy('updateProject').and.returnValue(of(mockProject)),
      deleteProject: jasmine.createSpy('deleteProject').and.returnValue(of({ message: 'Deleted' }))
    };

    usersServiceMock = {
      listUsers: jasmine.createSpy('listUsers').and.returnValue(of([{ id: 'u1', name: 'User 1', email: 'u1@test.com' }]))
    };

    authServiceMock = {
      me: jasmine.createSpy('me').and.returnValue(of({ _id: 'currentUser' }))
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [TaskComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit and load project, tasks, and users', () => {
    component.ngOnInit();
    expect(authServiceMock.me).toHaveBeenCalled();
    expect(projectServiceMock.getProject).toHaveBeenCalledWith('1');
    expect(projectServiceMock.listTasks).toHaveBeenCalledWith('1');
    expect(usersServiceMock.listUsers).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const formatted = component.formatDateToInput('2025-12-07T00:00:00Z');
    expect(formatted).toBe('2025-12-07');
  });

  it('should add a task', fakeAsync(() => {
    component.project = mockProject;
    component.taskTitle = 'New Task';
    component.taskDescription = 'Task description';
    component.taskStatus = 'todo';
    component.taskPriority = 'medium';
    component.taskDeadline = '2025-12-10';
    component.taskAssignee = 'u1';
    
    component.addTask();
    tick();

    expect(projectServiceMock.createTask).toHaveBeenCalled();
    expect(component.taskTitle).toBe('');
    expect(component.adding).toBeFalse();
  }));

  it('should open task modal', () => {
    component.openTaskModal(mockTask);
    expect(component.showTaskModal).toBeTrue();
    expect(component.selectedTask).toEqual(mockTask);
  });

  it('should get assignee name', () => {
    component.users = [{ _id: 'u1', name: 'User 1', email: 'a@b.com' }];
    const name = component.getAssigneeName('u1');
    expect(name).toBe('User 1');
  });

  it('should calculate completion', () => {
    component.tasks = [mockTask, { ...mockTask, status: 'done' }];
    component.doneTasks = [ { ...mockTask, status: 'done' } ];
    component.calculateCompletion();
    expect(component.completionPercentage).toBe(50);
  });

  it('should show toast message', fakeAsync(() => {
    component.showToastMessage('Test', 'success');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('should detect assignee conflict', () => {
    component.tasks = [mockTask];
    component.users = [{ _id: 'u1', name: 'User 1', email: 'a@b.com' }];
    component.taskAssignee = 'u1';
    component.taskDeadline = '2025-12-07';
    component.onAssigneeOrDeadlineChange();
    expect(component.conflictWarning).toContain('⚠️ User 1');
  });

  it('should add a member', fakeAsync(() => {
    component.project = mockProject;
    component.newMemberId = 'u1';
    component.addMember();
    tick();
    expect(projectServiceMock.updateProject).toHaveBeenCalled();
    expect(component.addingMember).toBeFalse();
    expect(component.newMemberId).toBe('');
  }));

  it('should delete member', fakeAsync(() => {
    component.project = { ...mockProject, members: ['u1'] };
    component.memberToDelete = 'u1';
    component.confirmDeleteMember();
    tick();
    expect(projectServiceMock.updateProject).toHaveBeenCalled();
    expect(component.showDeleteMemberModal).toBeFalse();
    expect(component.memberToDelete).toBeNull();
  }));

  it('should change task status', fakeAsync(() => {
    component.selectedTask = mockTask;
    component.changeTaskStatus('in progress');
    tick();
    expect(projectServiceMock.updateTask).toHaveBeenCalled();
    expect(component.selectedTask!.status).toBe('in progress');
  }));

  it('should delete task', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.selectedTask = mockTask;
    component.deleteTask();
    tick();
    expect(projectServiceMock.deleteTask).toHaveBeenCalledWith(mockTask._id);
    expect(component.showTaskModal).toBeFalse();
  }));
});
