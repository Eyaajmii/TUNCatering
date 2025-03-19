import { Component, OnInit } from '@angular/core';
import { MenuServiceService } from '../../../services/menu-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ajout-menu',
  standalone:true,
  imports: [FormsModule,CommonModule],
  templateUrl: './ajout-menu.component.html',
  styleUrl: './ajout-menu.component.css'
})
export class AjoutMenuComponent implements OnInit {
  //plats:any[]=[];
  PlatsPrincipaux:any[]=[];
  PlatsEntree:any[]=[];
  PlatsDessert:any[]=[];
  selectedMenu={
    nom:'',
    PlatsPrincipaux:'',
    PlatsEntree:'',
    PlatsDessert:'',
  };
  constructor(private menuService:MenuServiceService){}
  ngOnInit(): void {
    this.selectedPlats();
  }
  selectedPlats(){
    this.menuService.TousPrincipaux().subscribe(data=>this.PlatsPrincipaux=data);
    this.menuService.TousEntree().subscribe(data=>this.PlatsEntree=data);
    this.menuService.TousDessert().subscribe(data=>this.PlatsDessert=data);
  }
  onSubmit():void{
    const menudata={
      nom:this.selectedMenu.nom,
      PlatsPrincipaux:[this.selectedMenu.PlatsPrincipaux],
      PlatsEntree:[this.selectedMenu.PlatsEntree],
      PlatsDessert:[this.selectedMenu.PlatsDessert],
    };
    this.menuService.creerMenu(menudata).subscribe({
      next:(res)=>{
        alert("Menu crée !");
        console.log("Menu crée",res);
      },
      error:(err)=>{
        console.log(err);
        alert('Differents category!!!!');
      }
  });
  }

}
