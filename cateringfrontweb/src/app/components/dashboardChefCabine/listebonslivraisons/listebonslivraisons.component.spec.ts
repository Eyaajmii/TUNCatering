import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListebonslivraisonsComponent } from './listebonslivraisons.component';

describe('ListebonslivraisonsComponent', () => {
  let component: ListebonslivraisonsComponent;
  let fixture: ComponentFixture<ListebonslivraisonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListebonslivraisonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListebonslivraisonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
