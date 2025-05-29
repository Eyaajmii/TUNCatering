import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashPersonnelComponent } from './dash-personnel.component';

describe('DashPersonnelComponent', () => {
  let component: DashPersonnelComponent;
  let fixture: ComponentFixture<DashPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashPersonnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
