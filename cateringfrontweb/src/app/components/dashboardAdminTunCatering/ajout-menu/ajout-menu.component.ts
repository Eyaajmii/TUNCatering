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
  plats:any[]=[];
  selectedMenu={
    nom:'',
    PlatsPrincipaux:'',
    PlatsEntree:'',
    PlatsDessert:'',
  };
  constructor(private menuService:MenuServiceService){}
  ngOnInit(): void {
    this.menuService.TousPlats().subscribe(
      (data) => {
        this.plats = data;
      }
    );
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
        console.log(res);
        alert("Menu créé !");
      },
      error:(err)=>{
        console.log(err);
        alert('Differents category!!!!');
      }
  });
  }

}
