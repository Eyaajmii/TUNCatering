import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllbonslivraisonsComponent } from './allbonslivraisons.component';

describe('AllbonslivraisonsComponent', () => {
  let component: AllbonslivraisonsComponent;
  let fixture: ComponentFixture<AllbonslivraisonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllbonslivraisonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllbonslivraisonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
