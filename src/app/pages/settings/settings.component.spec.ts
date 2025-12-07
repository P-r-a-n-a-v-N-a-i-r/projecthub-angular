import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SettingsComponent } from './settings.component';
import { AuthService } from '../../core/services/auth.service';  // Adjust path as needed
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SettingsComponent],
      providers: [{
  provide: AuthService,
  useValue: {
    isAuthenticated: () => false,
    logout: () => {},
    me: () => ({ subscribe: () => {} })  // Add me method
  }
}],
schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
