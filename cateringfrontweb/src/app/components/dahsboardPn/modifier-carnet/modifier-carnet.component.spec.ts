import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierCarnetComponent } from './modifier-carnet.component';

describe('ModifierCarnetComponent', () => {
  let component: ModifierCarnetComponent;
  let fixture: ComponentFixture<ModifierCarnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierCarnetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierCarnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
