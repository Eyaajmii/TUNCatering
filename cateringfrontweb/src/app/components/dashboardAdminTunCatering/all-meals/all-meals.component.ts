import { Component, OnInit } from '@angular/core';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-meals',
  imports: [CommonModule],
  templateUrl: './all-meals.component.html',
  styleUrl: './all-meals.component.css'
})
export class AllMealsComponent implements OnInit{
  plats:Plat[]=[];
  constructor(private mealService:PlatServiceService){}
  ngOnInit(): void {
    this.mealService.getallPlats().subscribe(data => {
      console.log("Données des menus reçues :", data);
      this.plats = data;
    });
  }
}
