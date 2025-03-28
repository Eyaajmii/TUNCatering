import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeMenuComponent } from './commande-menu.component';

describe('CommandeMenuComponent', () => {
  let component: CommandeMenuComponent;
  let fixture: ComponentFixture<CommandeMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
