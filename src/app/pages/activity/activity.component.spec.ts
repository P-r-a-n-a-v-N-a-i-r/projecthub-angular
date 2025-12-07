import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivityComponent } from './activity.component';
import { ActivityService } from '../../core/services/activity.service'; // adjust path
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ActivityComponent],
      providers: [{
        provide: ActivityService,
        useValue: {
          getAll: () => ({ subscribe: () => { } })
        }
      }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
