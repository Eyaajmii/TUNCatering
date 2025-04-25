import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { Router, RouterLink, RouterOutlet} from '@angular/router';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { ToastrService } from 'ngx-toastr';
import { ReclamationServiceService } from '../../../services/reclamation-service.service';

@Component({
  selector: 'app-acceuil-interface',
  imports: [RouterOutlet,CommonModule],
  templateUrl: './acceuil-interface.component.html',
  styleUrl: './acceuil-interface.component.css'
})
export class AcceuilInterfaceComponent implements OnInit{
  notifications: any[] = [];
  constructor(private commandeService:CommandeServiceService,private toastr:ToastrService ,private reclamationService:ReclamationServiceService ){}
  ngOnInit(): void {
    this.commandeService.getStatusUpdates().subscribe(notification => {
      //this.notifications.push(notification);
      this.toastr.info(notification.message,"Statut de la commande mis à jour");
    });
    this.reclamationService.getStatusUpdate().subscribe(notification => {
      //this.notifications.push(notification);
       this.toastr.info(notification.message,"Statut de la réclamation a mis à jour");
     });
  }
}
