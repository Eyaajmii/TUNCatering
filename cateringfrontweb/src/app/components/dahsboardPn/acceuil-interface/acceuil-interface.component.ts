import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-acceuil-interface',
  imports: [CommonModule],
  templateUrl: './acceuil-interface.component.html',
  styleUrl: './acceuil-interface.component.css'
})
export class AcceuilInterfaceComponent implements OnInit{
  menus:Menu[]=[];
  plats:Plat[]=[];
  constructor(private menuService:MenuServiceService,private platService:PlatServiceService,private router:Router){}
  ngOnInit(): void {
    this.menuService.TousMenu().subscribe(data => {
      console.log("Données des menus reçues :", data);
      this.menus = data;
    });
    this.platService.getallPlats().subscribe(data=>{
      console.log("Données des plats reçues :", data);
      this.plats=data;
    });
  }
  commander(nom:string):void{
    this.router.navigate(['/commandeMenu'],{queryParams:{Menu:nom}});
  }

  
  

}
