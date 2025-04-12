import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAdminDirectionPersonnelComponent } from './dashboard-admin-direction-personnel.component';

describe('DashboardAdminDirectionPersonnelComponent', () => {
  let component: DashboardAdminDirectionPersonnelComponent;
  let fixture: ComponentFixture<DashboardAdminDirectionPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAdminDirectionPersonnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAdminDirectionPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
