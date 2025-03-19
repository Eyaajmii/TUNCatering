import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommadeComponent } from './commade.component';

describe('CommadeComponent', () => {
  let component: CommadeComponent;
  let fixture: ComponentFixture<CommadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
