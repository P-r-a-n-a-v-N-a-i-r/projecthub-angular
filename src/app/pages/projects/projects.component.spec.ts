import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProjectsComponent } from './projects.component';
import { AuthService } from '../../core/services/auth.service';  // Adjust path as needed
import { NO_ERRORS_SCHEMA } from '@angular/core'; 
import { ProjectService } from '../../core/services/project.service';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ProjectsComponent],
      providers: [{
  provide: AuthService,
  useValue: { isAuthenticated: () => false, logout: () => {} }
}, {
  provide: ProjectService,  // Add this
  useValue: {
    getAll: () => ({ subscribe: () => {} })
  }
}],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
