import { Component, OnInit } from '@angular/core';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-all-meals',
  imports: [CommonModule],
  templateUrl: './all-meals.component.html',
  styleUrl: './all-meals.component.css'
})
export class AllMealsComponent implements OnInit{
  //NavOpen:boolean=true;
  plats:Plat[]=[];
  PlatFiltre:Plat|null=null;
  constructor(private mealService:PlatServiceService,private router: Router,private route:ActivatedRoute){}
  ngOnInit(): void {
    this.loadPlats();
  }
  loadPlats() {
    this.mealService.getallPlats().subscribe(data => {
      this.plats = data;
      this.route.queryParams.subscribe(params => {
        const platId = params['platId'];
        if (platId) {
          this.PlatFiltre = this.plats.find(p => p._id === platId) || null;
        } else {
          this.PlatFiltre = null;
        }
      });
    });
  }
  modifier(id: string | undefined) {
    if (id) {
      this.router.navigate(['/DashAdmin/Plat/ModifierPlat', id]);
    }
  }
  supprimer(id: string | undefined) {
    if (id) {
      const confirmation = confirm("Voulez-vous vraiment supprimer ce plat ?");
      if (confirmation) {
        this.mealService.supprimerPlat(id).subscribe({
          next: () => {
            alert('Plat supprimé avec succès.');
            this.loadPlats();
          },
          error: (error) => {
            alert('Erreur lors de la suppression.');
            console.error(error);
          }
        });
      }
    }
  }
  retour(){
    this.router.navigate(['/DashAdmin/Menu/TousMenu'])
  }
}
