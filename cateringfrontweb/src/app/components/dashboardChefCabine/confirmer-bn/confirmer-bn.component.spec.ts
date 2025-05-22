import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmerBnComponent } from './confirmer-bn.component';

describe('ConfirmerBnComponent', () => {
  let component: ConfirmerBnComponent;
  let fixture: ComponentFixture<ConfirmerBnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmerBnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmerBnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
