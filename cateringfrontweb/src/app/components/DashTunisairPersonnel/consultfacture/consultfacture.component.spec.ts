import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultfactureComponent } from './consultfacture.component';

describe('ConsultfactureComponent', () => {
  let component: ConsultfactureComponent;
  let fixture: ComponentFixture<ConsultfactureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultfactureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultfactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
