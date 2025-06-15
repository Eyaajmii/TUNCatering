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
  selectedStatut: string = 'Tous';
  errorMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  private subscriptions: Subscription = new Subscription(); 
  selectedBnId: string | null = null;
  selectedBnDetail: any = null;
  constructor(private bonLivraisonService: BonLivraisonService,private router: Router) {}

  ngOnInit(): void {
    this.loadBonsLivraison();
    this.setupWebSocketListeners();
    this.subscriptions.add(
      this.bonLivraisonService.getStatusUpdate().subscribe(update => {
        const index = this.bonsLivraison.findIndex(bn => bn._id === update.bnId);
        if (index !== -1) {
          this.bonsLivraison[index].Statut = update.Statut;
          this.bonsLivraison[index].conformite = update.conformite;
        }
      })
    );    
  }

  loadBonsLivraison(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.bonLivraisonService.tousBonsChef().subscribe({
      next: (bons: BonLivraison[]) => {
          this.bonsLivraison = bons;
          this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur serveur lors du chargement des bons de livraison';
        this.isLoading = false;
      }
    });
  }
  setupWebSocketListeners() {
    this.subscriptions.add(
      this.bonLivraisonService.getNewBN().subscribe({
        next: (r: any) => {
          console.log('Nouvelle bon de livraison reçu:', r);
          this.bonsLivraison.unshift(this.transformBn(r));
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles factures:', err);
        }
      })
    );
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
      case 'Validé': return 'bg-success';
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
  get bonsLivraisonFiltres(): BonLivraison[] {
    if (this.selectedStatut === 'Tous') {
      return this.bonsLivraison;
    }
    return this.bonsLivraison.filter(bon => bon.Statut === this.selectedStatut);
  }
  toggleDetails(bnId: string) {
    if (this.selectedBnId === bnId) {
      this.selectedBnId = null;
      this.selectedBnDetail = null;
    } else {
      this.selectedBnId = bnId;
      this.bonLivraisonService.getBnById(bnId).subscribe({
        next: (data) => {
          this.selectedBnDetail = data;
        },
        error: () => {
          this.selectedBnDetail = null;
        }
      });
    }
  }
  aller(id: string | undefined) {
    if (id) {
      this.router.navigate(['/DashboardChefCabine/Statutbn', id]);
    }
  }
}