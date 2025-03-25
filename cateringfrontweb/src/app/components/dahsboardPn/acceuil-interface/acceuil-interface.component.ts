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
  PlatsEntree:Plat[]=[];
  PlatsPrincipaux:Plat[]=[];
  PlatsDessert:Plat[]=[];
  //Selected meals
  EntreeSelectionne:Plat|null=null;
  PrincipauxSelectionne:Plat|null=null;
  DessertSelectionne:Plat|null=null;
  constructor(private menuService:MenuServiceService,private platService:PlatServiceService,private router:Router){}
  ngOnInit(): void {
    this.menuService.TousMenu().subscribe(data => {
      console.log("Données des menus reçues :", data);
      this.menus = data;
    });

    this.platService.getallPlats().subscribe(data=>{
      this.plats=data;

      this.PlatsEntree=this.plats.filter(plat=>plat.typePlat==="Entrée");
      this.PlatsPrincipaux=this.plats.filter(plat=>plat.typePlat==="Plat Principal");
      this.PlatsDessert=this.plats.filter(plat=>plat.typePlat==="Dessert");
      console.log("Plats Entrées: ",this.PlatsEntree);
      console.log("Plats Principaux: ",this.PlatsPrincipaux);
      console.log("Plats Desserts: ",this.PlatsDessert);
    });
  }
  commanderMenu(nom:string):void{
    this.router.navigate(['/commandeMenu'],{queryParams:{Menu:nom}});
  }
  //deactiverLesautresplats
  SelectedMeal(p: Plat, typePlat: string) {
    if (typePlat === "Entrée") {
      this.EntreeSelectionne = p;
    } else if (typePlat === 'Plat Principal') {
      this.PrincipauxSelectionne = p;
    } else if (typePlat === 'Dessert') {
      this.DessertSelectionne = p;
    }
  
    if (this.EntreeSelectionne && this.PrincipauxSelectionne && this.DessertSelectionne) {
      this.router.navigate(['/PanierPlats'], {
        queryParams: {
          Entree: this.EntreeSelectionne.nom,
          Principaux: this.PrincipauxSelectionne.nom,
          Dessert: this.DessertSelectionne.nom
        }
      });
    }
  }
  
}
