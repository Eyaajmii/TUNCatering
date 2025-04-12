import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-dir-personnel',
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './dashboard-dir-personnel.component.html',
  styleUrl: './dashboard-dir-personnel.component.css'
})
export class DashboardDirPersonnelComponent {
    NavOpen: boolean = true;

}
