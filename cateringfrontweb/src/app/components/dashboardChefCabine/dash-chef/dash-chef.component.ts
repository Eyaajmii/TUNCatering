import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
@Component({
  selector: 'app-dash-chef',
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './dash-chef.component.html',
  styleUrl: './dash-chef.component.css'
})
export class DashChefComponent {
  NavOpen: boolean = true;
}
