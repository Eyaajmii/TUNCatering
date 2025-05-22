import { Component } from '@angular/core';
import { FactureService } from '../../../services/facture.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BonLivraisonService } from '../../../services/bon-livraison.service';

@Component({
  selector: 'app-ajout-facture',
  imports: [FormsModule,CommonModule],
  templateUrl: './ajout-facture.component.html',
  styleUrl: './ajout-facture.component.css'
})
export class AjoutFactureComponent {
  facture: any = null;
  erreur: string = "";
  bons:any[]=[];
  constructor(private factureService: FactureService,private bonLivraisonService: BonLivraisonService ) {}
  rechercher(){
    this.bonLivraisonService.BonsLivraisonNonFacture().subscribe({
      next: (response) => {
          this.bons = response;
      },
      error: (err) => {
        console.error("Erreur dans la récupération des bons de livraisons:", err);
        this.bons = [];
      }
    });
  }
  onSubmit() {
    this.facture = null;
    this.erreur = "";

    this.factureService.ajouterFacture().subscribe({
      next: (res) => {
        this.facture = res.data;
      },
      error: (err) => {
        console.error('Erreur lors de la création de la facture :', err);
        this.erreur = "Une erreur est survenue lors de la création de la facture.";
      }
    });
  }
}
