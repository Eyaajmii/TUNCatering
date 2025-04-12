import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDirPersonnelComponent } from './dashboard-dir-personnel.component';

describe('DashboardDirPersonnelComponent', () => {
  let component: DashboardDirPersonnelComponent;
  let fixture: ComponentFixture<DashboardDirPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDirPersonnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDirPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
