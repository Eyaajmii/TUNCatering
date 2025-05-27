import { Component, OnDestroy, OnInit } from '@angular/core';
import { FactureService } from '../../../services/facture.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

export interface Facture {
  _id?: string;
  numeroFacture: string;
  dateCreation?: Date;
  DateFacture: Date;
  Statut:string;
  BonsLivraison?: string[];
  montantTotal: number;
  montantParVol: {
    vol: string; 
    montant: number;
  }[];
  montantParPn: {
    personnel: string; 
    montant: number;
  }[];
}

@Component({
  selector: 'app-tous-factures',
  imports: [CommonModule],
  templateUrl: './tous-factures.component.html',
  styleUrl: './tous-factures.component.css'
})
export class TousFacturesComponent implements OnInit, OnDestroy{
  factures:Facture[]=[];
  errorMessage: string | null = null;
  isLoading: boolean = false;
  successMessage: string = '';
  connectionStatus: boolean = false;
  readonly availableStatuses = [
    { value: 'en attente', display: 'En attente', class: 'en-attente' },
    { value: 'confirmé', display: 'Confirmé', class: 'confirmé' },
    { value: 'annulé', display: 'Annulé', class: 'annule' },
  ];
  private subscriptions: Subscription = new Subscription(); 
  constructor(private factureService:FactureService){}
  ngOnInit(): void {
    this.loadFactures();
    this.setupWebSocketListeners();
    this.subscriptions.add(
      this.factureService.onFactureStatusUpdate().subscribe(update => {
        const index = this.factures.findIndex(c => c._id === update._id);
        if (index !== -1) {
          this.factures[index].Statut = update.Statut;
        }
      })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  loadFactures() {
    this.isLoading = true;
    this.factureService.getAllFactures().subscribe({
        next: (facture: any[]) => {
            this.factures = facture;
            this.isLoading = false;
        },
        error: (err) => {
            console.error('Error loading facture:', err);
            this.errorMessage = 'Échec du chargement des factures';
            this.isLoading = false;
        }
    });
  }
  annulerFacture(id: string | undefined) {
    if (id) {
      const confirmation = confirm("Voulez-vous vraiment annuler cette facture ?");
      if (confirmation) {
        this.factureService.AnnulerFacture(id).subscribe({
          next: () => {
            this.loadFactures();
            alert('Facture annulée avec succès.');
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

  private transformFacture(facture:any):Facture{
    return {
      ...facture
    }
  }
  setupWebSocketListeners() {
    this.subscriptions.add(
      this.factureService.onNewFacture().subscribe({
        next: (f: any) => {
          console.log('Nouvelle facture reçue:', f);
          this.factures.unshift(this.transformFacture(f));
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles factures:', err);
          this.errorMessage = 'Erreur de réception des nouvelles factures';
        }
      })
    );
  }
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'En attente': return 'bg-warning';
      case 'Annulé': return 'bg-danger';
      case 'confirmé': return 'bg-success';
      default: return 'bg-info';
    }
  }

}
