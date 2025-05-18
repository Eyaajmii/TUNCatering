import { Component, OnInit } from '@angular/core';
import { BonLivraison, BonLivraisonService } from '../../../services/bon-livraison.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-bn',
  imports: [CommonModule],
  templateUrl: './update-bn.component.html',
  styleUrl: './update-bn.component.css'
})
export class UpdateBnComponent implements OnInit {
  bonLivraison!: BonLivraison;
  errorMessage = '';
  successMessage = '';
  constructor(private bnService:BonLivraisonService,private route:ActivatedRoute,private router:Router){}
  ngOnInit(): void {
    const bnId=this.route.snapshot.paramMap.get('id');
    if(bnId){this.bnService.getBnById(bnId).subscribe({
      next: (data) => {
        this.bonLivraison=data;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Erreur lors du chargement.';
      }
    });}
  }
  supprimerCommande(index: number): void {
    const confirmation = confirm("Voulez-vous supprimer cette commande du bon de livraison ?");
    if (confirmation && this.bonLivraison) {
      this.bonLivraison.commandes.splice(index, 1);
      this.updateBonLivraison();
    }
  }
  updateBonLivraison(): void {
    if (this.bonLivraison && this.bonLivraison._id) {
      const dataToUpdate = {
        commandes: this.bonLivraison.commandes
      } as BonLivraison;

      this.bnService.ModifierBonLivraison(this.bonLivraison._id, dataToUpdate).subscribe({
        next: () => {
          this.successMessage = 'Bon de livraison mis à jour avec succès.';
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'Erreur lors de la mise à jour.';
        }
      });
    }
  }
  retour(){
    this.router.navigate(['/DashAdmin/bonslivraison'])
  }
}
