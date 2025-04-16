import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TousreclamationComponent } from './tousreclamation.component';

describe('TousreclamationComponent', () => {
  let component: TousreclamationComponent;
  let fixture: ComponentFixture<TousreclamationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TousreclamationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TousreclamationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
