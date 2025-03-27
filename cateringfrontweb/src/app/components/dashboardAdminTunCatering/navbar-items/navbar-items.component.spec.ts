import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarItemsComponent } from './navbar-items.component';

describe('NavbarItemsComponent', () => {
  let component: NavbarItemsComponent;
  let fixture: ComponentFixture<NavbarItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
