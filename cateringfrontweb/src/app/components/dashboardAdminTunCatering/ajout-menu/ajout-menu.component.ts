import { Component, OnInit } from '@angular/core';
import { MenuServiceService } from '../../../services/menu-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { NavbarItemsComponent } from '../navbar-items/navbar-items.component';


@Component({
  selector: 'app-ajout-menu',
  standalone:true,
  imports: [FormsModule, CommonModule, NavbarComponent, NavbarItemsComponent],
  templateUrl: './ajout-menu.component.html',
  styleUrl: './ajout-menu.component.css'
})
export class AjoutMenuComponent implements OnInit {
  //plats:any[]=[];
  NavOpen:boolean=true;
  PlatsPrincipaux:any[]=[];
  PlatsEntree:any[]=[];
  PlatsDessert:any[]=[];
  Boissons:any[]=[];
  selectedMenu={
    nom:'',
    PlatsPrincipaux:'',
    PlatsEntree:'',
    PlatsDessert:'',
    Boissons:'',
    Disponible:false
  };
  constructor(private menuService:MenuServiceService){}
  ngOnInit(): void {
    this.selectedPlats();
  }
  selectedPlats(){
    this.menuService.TousPrincipaux().subscribe(data=>this.PlatsPrincipaux=data);
    this.menuService.TousEntree().subscribe(data=>this.PlatsEntree=data);
    this.menuService.TousDessert().subscribe(data=>this.PlatsDessert=data);
    this.menuService.TousBoissons().subscribe(data=>this.Boissons=data);
  }
  onSubmit():void{
    const menudata={
      nom:this.selectedMenu.nom,
      PlatsPrincipaux:[this.selectedMenu.PlatsPrincipaux],
      PlatsEntree:[this.selectedMenu.PlatsEntree],
      PlatsDessert:[this.selectedMenu.PlatsDessert],
      Boissons:[this.selectedMenu.Boissons],
      Disponible:[this.selectedMenu.Disponible]
    };
    this.menuService.creerMenu(menudata).subscribe({
      next:(res)=>{
        alert("Menu crée !");
        console.log("Menu crée",res);
      },
      error:(err)=>{
        console.log(err);
        if(err.error && err.error.message==='Menu déja existe'){
          alert("Menu déja existe !");
        }else{
          alert('Erreur: ' + err.error.message || err.message);
        }
      }
  });
  }

}
