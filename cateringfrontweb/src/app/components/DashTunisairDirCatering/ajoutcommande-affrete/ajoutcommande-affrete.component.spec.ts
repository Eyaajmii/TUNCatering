import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutcommandeAffreteComponent } from './ajoutcommande-affrete.component';

describe('AjoutcommandeAffreteComponent', () => {
  let component: AjoutcommandeAffreteComponent;
  let fixture: ComponentFixture<AjoutcommandeAffreteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutcommandeAffreteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjoutcommandeAffreteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
