import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCommandeComponent } from './update-commande.component';

describe('UpdateCommandeComponent', () => {
  let component: UpdateCommandeComponent;
  let fixture: ComponentFixture<UpdateCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCommandeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
