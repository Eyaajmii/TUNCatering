import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBnComponent } from './update-bn.component';

describe('UpdateBnComponent', () => {
  let component: UpdateBnComponent;
  let fixture: ComponentFixture<UpdateBnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
