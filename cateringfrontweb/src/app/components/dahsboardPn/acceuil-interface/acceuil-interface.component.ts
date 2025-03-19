import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acceuil-interface',
  imports: [CommonModule],
  templateUrl: './acceuil-interface.component.html',
  styleUrl: './acceuil-interface.component.css'
})
export class AcceuilInterfaceComponent implements OnInit{
  menus:Menu[]=[];
  constructor(private menuService:MenuServiceService){}
  ngOnInit(): void {
    this.menuService.TousMenu().subscribe(data => {
      console.log("Données des menus reçues :", data);
      this.menus = data;
    });
  }
  

}
