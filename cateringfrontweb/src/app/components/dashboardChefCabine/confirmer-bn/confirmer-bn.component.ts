import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BonLivraison, BonLivraisonService } from '../../../services/bon-livraison.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmer-bn',
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmer-bn.component.html',
  styleUrls: ['./confirmer-bn.component.css']
})
export class ConfirmerBnComponent implements OnInit {
  bnId!: string;
  bonLivraison!: BonLivraison;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  commandesConfirmées: string[] = [];
  confirmerConformite = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bnService: BonLivraisonService
  ) {}

  ngOnInit(): void {
    this.bnId = this.route.snapshot.paramMap.get('id')!;
    if (this.bnId) {
      this.isLoading = true;
      this.bnService.getBnById(this.bnId).subscribe({
        next: (data) => {
          this.bonLivraison = data;
          this.commandesConfirmées = this.bonLivraison.commandes
            .filter(c => c.confirme)
            .map(c => c.commande._id);

          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors du chargement du bon de livraison.';
          this.isLoading = false;
          console.error(err);
        }
      });
    }
  }

  toggleCommande(id: string, checked: boolean): void {
    if (checked) {
      if (!this.commandesConfirmées.includes(id)) {
        this.commandesConfirmées.push(id);
      }
    } else {
      this.commandesConfirmées = this.commandesConfirmées.filter(c => c !== id);
    }
  
    const cmd = this.bonLivraison.commandes.find(c => c.commande._id === id);
    if (cmd) {
      cmd.confirme = checked;
    }
  
    this.confirmerConformite = this.commandesConfirmées.length === this.bonLivraison.commandes.length;
  }
  
  onGlobalConfirmationChange(checked: boolean): void {
    if (this.bonLivraison?.commandes) {
      if (checked) {
        this.commandesConfirmées = this.bonLivraison.commandes.map(c => c.commande._id);
        this.bonLivraison.commandes.forEach(c => c.confirme = true);
      } else {
        this.commandesConfirmées = [];
        this.bonLivraison.commandes.forEach(c => c.confirme = false);
      }
      this.confirmerConformite = checked;
    }
  }
  

  validerBonLivraison(): void {
    const id = this.bonLivraison?._id;
    if (!id) return;

    const payload = {
      confirmerConformite: this.confirmerConformite,
      commandesConfirmées: this.commandesConfirmées,
    };

    this.bnService.updateStatutBonLivraison(id, payload).subscribe({
      next: (res) => {
        alert('Bon de livraison mis à jour !');
        this.bonLivraison = res.data;
      },
      error: () => alert('Erreur lors de la mise à jour.')
    });
  }


  retourListe(): void {
    this.router.navigate(['/DashboardChefCabine/bonLivraison']);
  }
}
