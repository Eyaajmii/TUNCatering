import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeBonsLivraisonComponent } from './liste-bons-livraison.component';

describe('ListeBonsLivraisonComponent', () => {
  let component: ListeBonsLivraisonComponent;
  let fixture: ComponentFixture<ListeBonsLivraisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeBonsLivraisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeBonsLivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
