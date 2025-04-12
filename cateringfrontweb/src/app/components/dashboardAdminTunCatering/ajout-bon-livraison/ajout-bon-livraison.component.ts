import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BonLivraisonService } from '../../../services/bon-livraison.service';
import { CommandeServiceService } from '../../../services/commande-service.service';

@Component({
  selector: 'app-ajout-bon-livraison',
  imports: [CommonModule,FormsModule],
  templateUrl: './ajout-bon-livraison.component.html',
  styleUrl: './ajout-bon-livraison.component.css'
})
export class AjoutBonLivraisonComponent {
  numVol: string = '';
  commandes: any[] = [];
  errorMessage: string = '';
  selectedCommandes: string[] = [];
  personnelLivraisonId: string = '';

  constructor(
    private commandeService: CommandeServiceService,
    private bonLivraisonService: BonLivraisonService
  ) {}

  searchCommandes(): void {
    if (!this.numVol.trim()) {
      this.errorMessage = 'Veuillez entrer un numéro de vol.';
      return;
    }
    this.errorMessage = '';

    this.commandeService.getCommandesByVol(this.numVol).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.commandes = response.data;
          this.selectedCommandes = this.commandes.map((commande) => commande._id);
          this.errorMessage = '';
        } else {
          this.errorMessage = `Aucune commande trouvée pour le vol ${this.numVol}`;
          this.commandes = [];
        }
      },
      error: (err) => {
        console.error('Erreur dans la récupération des commandes:', err);
        this.errorMessage = 'Erreur lors de la récupération des commandes.';
        this.commandes = [];
      },
    });
  }

  createBonLivraison(): void {
    if (this.selectedCommandes.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins une commande.';
      return;
    }

    const bonLivraisonData: any = {
      numeroBon: `BL-${new Date().getFullYear()}-${(Math.random() * 10000).toFixed(0)}`, // Nombre temporaire
      volId: this.numVol,
      commandes: this.selectedCommandes,
      
    };

    if (this.personnelLivraisonId.trim()) {
      bonLivraisonData.personnelLivraison = this.personnelLivraisonId;
    }

    // Créer le bon de livraison
    this.bonLivraisonService.createBonLivraison(bonLivraisonData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage('Bon de Livraison créé avec succès!');
          this.downloadPdf(response.data.numeroBon);
        } else {
          this.errorMessage = 'Erreur lors de la création du Bon de Livraison.';
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur serveur';
      },
    });
  }

  private downloadPdf(numeroBon: string): void {
    this.bonLivraisonService.downloadPdf(numeroBon).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bon_livraison_${numeroBon}.pdf`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          link.remove();
        }, 100);
      },
      error: (err) => {
        console.error('Erreur de téléchargement:', err);
        this.showErrorMessage('PDF généré mais erreur lors du téléchargement');
      },
    });
  }
  private showSuccessMessage(message: string): void {
    // Afficher le message de succès
    alert(message); // Remplacer avec un composant de notification (e.g., Toastr)
  }

  private showErrorMessage(message: string): void {
    // Afficher le message d'erreur
    alert(message); // Remplacer avec un composant de notification (e.g., Toastr)
  }
}
