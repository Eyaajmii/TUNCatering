import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashTunisairComponent } from './dash-tunisair.component';

describe('DashTunisairComponent', () => {
  let component: DashTunisairComponent;
  let fixture: ComponentFixture<DashTunisairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashTunisairComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashTunisairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
