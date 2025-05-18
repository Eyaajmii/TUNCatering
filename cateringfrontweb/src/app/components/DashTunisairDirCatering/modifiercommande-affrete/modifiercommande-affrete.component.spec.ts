import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifiercommandeAffreteComponent } from './modifiercommande-affrete.component';

describe('ModifiercommandeAffreteComponent', () => {
  let component: ModifiercommandeAffreteComponent;
  let fixture: ComponentFixture<ModifiercommandeAffreteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifiercommandeAffreteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifiercommandeAffreteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
