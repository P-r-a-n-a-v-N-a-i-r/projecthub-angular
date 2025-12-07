import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TeamComponent } from './team.component';
import { UsersService, User } from '../../core/services/users.service';

describe('TeamComponent', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;
  let mockUsersService: jasmine.SpyObj<UsersService>;

  const mockUsers: User[] = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      projectsCount: 5,
      tasksCount: 12
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      projectsCount: 3,
      tasksCount: 8
    }
  ];

  beforeEach(async () => {
    mockUsersService = jasmine.createSpyObj<UsersService>('UsersService', [
      'listUsers', 
      'inviteMember'
    ] as any);

    mockUsersService.listUsers.and.returnValue(of(mockUsers));
    mockUsersService.inviteMember.and.returnValue(of({ message: 'Invitation sent' }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TeamComponent],
      providers: [
        { provide: UsersService, useValue: mockUsersService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on ngOnInit', () => {
    expect(mockUsersService.listUsers).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
    expect(component.users[0].name).toBe('John Doe');
  });

  it('should get user initials correctly', () => {
    expect(component.getUserInitials('John Doe')).toBe('JD');
    expect(component.getUserInitials('Jane')).toBe('J');
    expect(component.getUserInitials('')).toBe('');
    expect(component.getUserInitials('Bob')).toBe('B');
  });

  it('should open invite modal', () => {
    component.openInviteModal();

    expect(component.showInviteModal).toBeTruthy();
    expect(component.inviteEmail).toBe('');
    expect(component.inviteError).toBe('');
    expect(component.inviteSuccess).toBe('');
  });

  it('should close invite modal', () => {
    component.showInviteModal = true;
    component.inviteEmail = 'test@example.com';
    component.inviteError = 'Error';
    component.inviteSuccess = 'Success';
    component.inviteLoading = true;

    component.closeInviteModal();

    expect(component.showInviteModal).toBeFalsy();
    expect(component.inviteEmail).toBe('');
    expect(component.inviteError).toBe('');
    expect(component.inviteSuccess).toBe('');
    expect(component.inviteLoading).toBeFalsy();
  });

  it('should send invitation successfully', () => {
    component.inviteEmail = 'newuser@example.com';
    spyOn(component, 'closeInviteModal');

    component.sendInvitation();

    expect(mockUsersService.inviteMember).toHaveBeenCalledWith('newuser@example.com');
    expect(component.inviteSuccess).toBe('Invitation sent!');
    expect(component.inviteLoading).toBeFalsy();
  });

  it('should handle empty email error', () => {
    component.inviteEmail = '';

    component.sendInvitation();

    expect(mockUsersService.inviteMember).not.toHaveBeenCalled();
    expect(component.inviteError).toBe('Email is required');
    expect(component.inviteLoading).toBeFalsy();
  });

  it('should handle invitation error', () => {
    component.inviteEmail = 'test@example.com';
    mockUsersService.inviteMember.and.returnValue(throwError(() => ({ 
      error: { message: 'Email already exists' } 
    })));

    component.sendInvitation();

    expect(component.inviteError).toBe('Email already exists');
    expect(component.inviteLoading).toBeFalsy();
  });

  it('should handle generic invitation error', () => {
    component.inviteEmail = 'test@example.com';
    mockUsersService.inviteMember.and.returnValue(throwError(() => new Error('Network error')));

    component.sendInvitation();

    expect(component.inviteError).toBe('Failed to send invite');
    expect(component.inviteLoading).toBeFalsy();
  });
});
