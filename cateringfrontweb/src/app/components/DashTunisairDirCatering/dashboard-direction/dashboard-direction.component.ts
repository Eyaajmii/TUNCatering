import { Component, OnInit, OnDestroy } from '@angular/core';  
import { CommandeServiceService } from '../../../services/commande-service.service';  
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';


@Component({
  selector: 'app-dashboard-direction',
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './dashboard-direction.component.html',
  styleUrl: './dashboard-direction.component.css'
})
export class DashboardDirectionComponent{  
    NavOpen: boolean = true;
}