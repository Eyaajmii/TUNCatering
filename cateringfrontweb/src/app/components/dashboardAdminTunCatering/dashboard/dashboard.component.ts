import { Component, OnInit } from '@angular/core';
import { NavbarItemsComponent } from "../navbar-items/navbar-items.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
   NavOpen: boolean = true;
   notifications: any[] = [];
   constructor(private commandeService:CommandeServiceService, private toastr: ToastrService){}
 
   ngOnInit(): void {
    this.commandeService.getNewOrders().subscribe(notification => {
     // this.notifications.push(notification);
      this.toastr.success(notification.message,"Nouvelle commande recu");
    });
  }
}
