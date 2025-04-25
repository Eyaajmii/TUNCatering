import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TousPrelevementsComponent } from './tous-prelevements.component';

describe('TousPrelevementsComponent', () => {
  let component: TousPrelevementsComponent;
  let fixture: ComponentFixture<TousPrelevementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TousPrelevementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TousPrelevementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
