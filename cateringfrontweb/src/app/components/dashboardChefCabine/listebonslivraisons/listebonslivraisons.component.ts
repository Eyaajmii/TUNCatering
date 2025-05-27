import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BonLivraison, BonLivraisonService } from '../../../services/bon-livraison.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-listebonslivraisons',
  imports: [CommonModule, FormsModule],
  standalone:true,
  templateUrl: './listebonslivraisons.component.html',
  styleUrl: './listebonslivraisons.component.css'
})
export class ListebonslivraisonsComponent implements OnInit {
  bonsLivraison: BonLivraison[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  private subscriptions: Subscription = new Subscription(); 

  constructor(private bonLivraisonService: BonLivraisonService,private router: Router) {}

  ngOnInit(): void {
    this.bonLivraisonService.joinRoom('chef_cabine');
    this.loadBonsLivraison();
    this.subscriptions.add(
      this.bonLivraisonService.getNewBN().subscribe({
        next: (r: any) => {
          console.log('Nouvelle bon de livraison reçu:', r);
          this.bonsLivraison.unshift(r);
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles factures:', err);
        }
      })
    ); 
    this.subscriptions.add(
      this.bonLivraisonService.getStatusUpdate().subscribe(update => {
        const index = this.bonsLivraison.findIndex(bn => bn._id === update.bnId);
        if (index !== -1) {
          this.bonsLivraison[index] = {
            ...this.bonsLivraison[index],
            Statut: update.Statut,
            conformite: update.conformite,
          };
        }
      })
    );
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
 
  private transformBn(bn:any):BonLivraison{
    return {
      ...bn
    }
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
  aller(id: string | undefined) {
    if (id) {
      this.router.navigate(['/DashboardChefCabine/Statutbn', id]);
    }
  }
}