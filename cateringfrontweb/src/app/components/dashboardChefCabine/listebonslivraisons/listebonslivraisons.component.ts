import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BonLivraisonService } from '../../../services/bon-livraison.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-listebonslivraisons',
  imports: [CommonModule, FormsModule],
  standalone:true,
  templateUrl: './listebonslivraisons.component.html',
  styleUrl: './listebonslivraisons.component.css'
})
export class ListebonslivraisonsComponent implements OnInit {
  bonsLivraison: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  private realTimeSub!: Subscription;

  constructor(private bonLivraisonService: BonLivraisonService) {}

  ngOnInit(): void {
    this.loadBonsLivraison();
    
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

  updateStatutBonLivraison(bonId: string, newStatut: string): void {
    if (confirm(`Êtes-vous sûr de vouloir changer le statut du bon de livraison à "${newStatut}" ?`)) {
      this.isLoading = true;
      this.errorMessage = '';

      this.bonLivraisonService.updateStatutBonLivraison(bonId, newStatut).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.successMessage = 'Statut du bon de livraison mis à jour avec succès';
            this.loadBonsLivraison(); 
          } else {
            this.errorMessage = response.message || 'Erreur lors de la mise à jour du statut';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.errorMessage = 'Erreur serveur lors de la mise à jour du statut';
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