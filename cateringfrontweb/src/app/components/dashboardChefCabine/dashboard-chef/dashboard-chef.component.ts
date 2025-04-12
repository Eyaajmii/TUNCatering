import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-chef',
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './dashboard-chef.component.html',
  styleUrl: './dashboard-chef.component.css'
})
export class DashboardChefComponent {
  NavOpen: boolean = true;

}
