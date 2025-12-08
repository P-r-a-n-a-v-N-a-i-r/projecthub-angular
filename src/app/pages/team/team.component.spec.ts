import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TeamComponent } from './team.component';
import { UsersService } from '../../core/services/users.service';  // Adjust path as needed
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TeamComponent', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TeamComponent],
      providers: [{
        provide: UsersService,
        useValue: {
          listUsers: () => ({ subscribe: () => { } })  // Add listUsers method
        }
      }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
