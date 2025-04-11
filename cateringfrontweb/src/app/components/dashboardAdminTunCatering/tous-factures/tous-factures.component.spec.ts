import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TousFacturesComponent } from './tous-factures.component';

describe('TousFacturesComponent', () => {
  let component: TousFacturesComponent;
  let fixture: ComponentFixture<TousFacturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TousFacturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TousFacturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
