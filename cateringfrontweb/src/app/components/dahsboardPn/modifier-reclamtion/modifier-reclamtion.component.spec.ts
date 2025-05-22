import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierReclamtionComponent } from './modifier-reclamtion.component';

describe('ModifierReclamtionComponent', () => {
  let component: ModifierReclamtionComponent;
  let fixture: ComponentFixture<ModifierReclamtionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierReclamtionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierReclamtionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
