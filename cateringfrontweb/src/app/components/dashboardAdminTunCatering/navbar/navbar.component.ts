import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  //source:https://stackblitz.com/edit/toggle
  //-sidebar?file=src%2Fapp%2Fapp.component.ts
  NavOpen:boolean=false;
  status:boolean=false;
  statusLink:boolean=false;
  @Output() togglesidebar=new EventEmitter<void>();
  ontogglesidebar():void{
    this.togglesidebar.emit();
  }
}
