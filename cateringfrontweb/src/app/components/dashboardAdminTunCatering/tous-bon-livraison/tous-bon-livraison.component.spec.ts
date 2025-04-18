import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TousBonLivraisonComponent } from './tous-bon-livraison.component';

describe('TousBonLivraisonComponent', () => {
  let component: TousBonLivraisonComponent;
  let fixture: ComponentFixture<TousBonLivraisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TousBonLivraisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TousBonLivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
