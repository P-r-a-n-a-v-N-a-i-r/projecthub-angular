import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { TeamComponent } from './team.component';
import { UsersService } from '../../core/services/users.service';

describe('TeamComponent', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;
  let mockUsersService: jasmine.SpyObj<UsersService>;

  beforeEach(async () => {
    // Create spy for UsersService
    mockUsersService = jasmine.createSpyObj<UsersService>('UsersService', ['listUsers', 'inviteMember']);

    // Return Observables for service methods
    mockUsersService.listUsers.and.returnValue(of([])); // empty user list
    mockUsersService.inviteMember.and.returnValue(of({ success: true })); // simulate invite success

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TeamComponent],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getUserInitials should handle single name', () => {
    expect(component.getUserInitials('John')).toBe('J');
    expect(component.getUserInitials('')).toBe('');
  });

  it('getUserInitials should handle full name', () => {
    expect(component.getUserInitials('John Doe')).toBe('JD');
    expect(component.getUserInitials('Alice Bob')).toBe('AB');
  });

  it('openInviteModal should set state', () => {
    component.openInviteModal();
    expect(component.showInviteModal).toBe(true);
    expect(component.inviteEmail).toBe('');
  });

  it('closeInviteModal should reset state', () => {
    component.showInviteModal = true;
    component.inviteError = 'error';
    component.inviteEmail = 'test@test.com';

    component.closeInviteModal();

    expect(component.showInviteModal).toBe(false);
    expect(component.inviteError).toBe('');
    expect(component.inviteEmail).toBe('');
  });

  it('sendInvitation should validate empty email', () => {
    component.inviteEmail = '';
    component.sendInvitation();
    expect(component.inviteError).toBe('Email is required');
  });

  it('sendInvitation should call service with valid email', () => {
    component.inviteEmail = 'test@example.com';
    component.sendInvitation();
    expect(mockUsersService.inviteMember).toHaveBeenCalledWith('test@example.com');
  });
});
