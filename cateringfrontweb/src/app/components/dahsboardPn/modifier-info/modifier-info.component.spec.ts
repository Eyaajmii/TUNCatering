import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierInfoComponent } from './modifier-info.component';

describe('ModifierInfoComponent', () => {
  let component: ModifierInfoComponent;
  let fixture: ComponentFixture<ModifierInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
