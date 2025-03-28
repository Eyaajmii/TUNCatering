import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar-items',
  standalone:true,
  imports: [CommonModule,RouterLink],
  templateUrl: './navbar-items.component.html',
  styleUrl: './navbar-items.component.css'
})
export class NavbarItemsComponent {
  @Input() status:boolean=true;
}
