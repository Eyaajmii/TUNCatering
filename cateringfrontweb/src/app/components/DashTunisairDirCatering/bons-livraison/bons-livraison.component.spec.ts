import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonsLivraisonComponent } from './bons-livraison.component';

describe('BonsLivraisonComponent', () => {
  let component: BonsLivraisonComponent;
  let fixture: ComponentFixture<BonsLivraisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonsLivraisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonsLivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
