import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BonLivraisonService } from '../../../services/bon-livraison.service';

@Component({
  selector: 'app-allbonslivraisons',
  imports: [CommonModule,FormsModule],
  templateUrl: './allbonslivraisons.component.html',
  styleUrl: './allbonslivraisons.component.css'
})
export class AllbonslivraisonsComponent implements OnInit, OnDestroy {
  bonsLivraison: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';

  constructor(private bonLivraisonService: BonLivraisonService) {}

  ngOnInit(): void {
    this.loadBonsLivraison();
    this.bonLivraisonService.getBonsLivraisonRealTime().subscribe(updatedBonsLivraison => {
      this.bonsLivraison = updatedBonsLivraison;
    });
  }

  ngOnDestroy(): void {
    // Déconnectez-vous du socket lors de la destruction du composant
    this.bonLivraisonService.disconnectSocket();
  }

  loadBonsLivraison(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.bonLivraisonService.getAllBonsLivraison().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.bonsLivraison = response.data;
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des bons de livraison';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur serveur lors du chargement des bons de livraison';
        this.isLoading = false;
      }
    });
  }

  downloadPdf(numeroBon: string): void {
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
        this.errorMessage = 'Erreur lors du téléchargement du PDF';
      }
    });
  }

  cancelBonLivraison(bonId: string): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ce bon de livraison ? Cette action est irréversible.')) {
      this.isLoading = true;
      this.errorMessage = '';

      this.bonLivraisonService.cancelBonLivraison(bonId).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.successMessage = 'Bon de livraison annulé avec succès';
            this.loadBonsLivraison(); // Rafraîchir la liste
          } else {
            this.errorMessage = response.message || 'Erreur lors de l\'annulation du bon';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.errorMessage = 'Erreur serveur lors de l\'annulation';
          this.isLoading = false;
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'En attente': return 'bg-warning';
      case 'Annulé': return 'bg-danger';
      case 'Livré': return 'bg-success';
      case 'En retard': return 'bg-secondary';
      default: return 'bg-info';
    }
  }

  getConformiteBadgeClass(conformite: string): string {
    switch (conformite) {
      case 'Confirmé': return 'bg-success';
      case 'Non confirmé': return 'bg-danger';
      case 'En attente': return 'bg-warning';
      default: return 'bg-info';
    }
  }
}