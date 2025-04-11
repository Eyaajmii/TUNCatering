import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { Router, RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-acceuil-interface',
  imports: [RouterOutlet,CommonModule],
  templateUrl: './acceuil-interface.component.html',
  styleUrl: './acceuil-interface.component.css'
})
export class AcceuilInterfaceComponent {

}
