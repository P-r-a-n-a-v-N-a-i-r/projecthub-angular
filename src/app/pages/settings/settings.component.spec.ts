import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SettingsComponent } from './settings.component';
import { AuthService, User } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { ProjectService, Project } from '../../core/services/project.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;

  const mockUser: any = {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    authentication: 'email'
  };

  const mockProjects: Project[] = [
    { 
      _id: 'proj1', 
      name: 'Project 1', 
      description: 'Description 1',
      owner: 'user1', 
      status: 'Planning',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      members: [],
      tags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    { 
      _id: 'proj2', 
      name: 'Project 2', 
      description: 'Description 2',
      owner: 'user1', 
      status: 'In Progress',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      members: [],
      tags: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    // ✅ FIXED: jasmine.createSpyObj with 'as any' type assertion
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['me', 'logout'] as any);
    mockSettingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'updateProfile', 'resetPassword', 'deleteAccount'
    ] as any);
    mockProjectService = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'listProjects', 'deleteProject'
    ] as any);

    mockAuthService.me.and.returnValue(of(mockUser));
    mockSettingsService.updateProfile.and.returnValue(of(mockUser));
    mockSettingsService.resetPassword.and.returnValue(of({ message: 'Password reset' }));
    mockSettingsService.deleteAccount.and.returnValue(of({ message: 'Account deleted' }));
    mockProjectService.listProjects.and.returnValue(of(mockProjects));
    mockProjectService.deleteProject.and.returnValue(of({ message: 'Project deleted' }));

    mockAuthService.currentUser$ = { next: jasmine.createSpy('next') } as any;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [SettingsComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ProjectService, useValue: mockProjectService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user on ngOnInit', () => {
    component.ngOnInit();

    expect(mockAuthService.me).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
    expect(component.userInitials).toBe('JD');
    expect(component.profileForm.get('name')?.value).toBe('John Doe');
    expect(component.showResetPasswordForm).toBeTruthy();
  });

  it('should get initials correctly', () => {
    expect(component['getUserInitials']('John Doe')).toBe('JD');
    expect(component['getUserInitials']('Jane')).toBe('J');
    expect(component['getUserInitials']('')).toBe('');
  });

  it('should update profile successfully', () => {
    component.profileForm.patchValue({ name: 'Jane Doe' });
    component.updateProfile();

    expect(mockSettingsService.updateProfile).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Jane Doe' }));
    expect(component.profileSuccess).toBe('Profile updated!');
  });

  it('should handle profile update error', () => {
    mockSettingsService.updateProfile.and.returnValue(throwError(() => ({ error: { message: 'Update failed' } })));
    component.profileForm.patchValue({ name: 'Jane Doe' });
    
    component.updateProfile();

    expect(component.profileError).toBe('Update failed');
  });

  it('should skip update if form invalid', () => {
    component.profileForm.get('name')?.setValue('');
    
    component.updateProfile();

    expect(mockSettingsService.updateProfile).not.toHaveBeenCalled();
  });

  it('should reset password successfully', () => {
    component.currentPassword = 'old123';
    component.newPassword = 'new123';
    component.confirmNewPassword = 'new123';

    component.resetPassword();

    expect(mockSettingsService.resetPassword).toHaveBeenCalledWith({
      currentPassword: 'old123',
      newPassword: 'new123'
    });
  });

  it('should detect password mismatch', () => {
    component.currentPassword = 'old123';
    component.newPassword = 'new123';
    component.confirmNewPassword = 'wrong123';

    component.resetPassword();

    expect(component.passwordMismatch).toBeTruthy();
    expect(mockSettingsService.resetPassword).not.toHaveBeenCalled();
  });

  it('should load owned projects in delete dialog', () => {
    component.user = mockUser;
    component.openDeleteDialog();

    expect(mockProjectService.listProjects).toHaveBeenCalled();
    expect(component.ownedProjects.length).toBe(2);
  });

  // ✅ FIXED: NO spyOn - just test the service call
  it('should delete account directly if no projects', () => {
    component.user = mockUser;
    component.ownedProjects = [];
    
    component.confirmDeleteAccount();

    expect(mockSettingsService.deleteAccount).toHaveBeenCalled();
  });

  it('should show toast message lifecycle', () => {
    jasmine.clock().install();
    component.showToastMessage('Test', 'success');

    expect(component.toastMessage).toBe('Test');
    expect(component.showToast).toBeTruthy();
    
    jasmine.clock().tick(5000);
    expect(component.showToast).toBeFalsy();
    
    jasmine.clock().uninstall();
  });
});
