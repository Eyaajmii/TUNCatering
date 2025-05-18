import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BonLivraisonService } from '../../../services/bon-livraison.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tous-bon-livraison',
  imports: [CommonModule,FormsModule],
  templateUrl: './tous-bon-livraison.component.html',
  styleUrl: './tous-bon-livraison.component.css'
})
export class TousBonLivraisonComponent implements OnInit {
  bonsLivraison: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';

  constructor(private bonLivraisonService: BonLivraisonService,private router: Router) {}

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

  annulerBonLivraison(id: string | undefined) {
    if (id) {
      const confirmation = confirm("Voulez-vous vraiment annuler ce bon de livraison ?");
      if (confirmation) {
        this.bonLivraisonService.annulerBonLivraison(id).subscribe({
          next: () => {
            this.loadBonsLivraison();
          },
          error: (error) => {
            if (error.error && typeof error.error === 'string') {
              alert(error.error);
            } else if (error.error && error.error.message) {
              alert(error.error.message);
            } else {
              alert('Erreur lors de l\'annulation.');
            }
            console.error(error);
          }
        });
      }
    }
  }
  modifierBn(id: string){
    if (id) {
      this.router.navigate(['/DashAdmin/ModifierBonLivraison', id]);
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