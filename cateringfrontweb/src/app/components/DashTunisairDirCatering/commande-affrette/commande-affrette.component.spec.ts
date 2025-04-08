import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeAffretteComponent } from './commande-affrette.component';

describe('CommandeAffretteComponent', () => {
  let component: CommandeAffretteComponent;
  let fixture: ComponentFixture<CommandeAffretteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeAffretteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeAffretteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
