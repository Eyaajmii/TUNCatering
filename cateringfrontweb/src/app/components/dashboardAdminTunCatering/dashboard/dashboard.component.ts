import { Component } from '@angular/core';
import { NavbarItemsComponent } from "../navbar-items/navbar-items.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-dashboard',
  imports: [NavbarItemsComponent, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  NavOpen:boolean=true;
}
