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
  selector: 'app-consultfacture',
  imports: [CommonModule],
  templateUrl: './consultfacture.component.html',
  styleUrl: './consultfacture.component.css'
})
export class ConsultfactureComponent implements OnInit, OnDestroy{
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
    this.subscriptions.add(
      this.factureService.onFactureStatusUpdate().subscribe({
        next: (update: any) => {
          const index = this.factures.findIndex(c => c._id === update._id);
          if (index !== -1) {
            this.factures[index] = this.transformFacture({
              ...this.factures[index],
              ...update
            });
          }
        },
        error: (err) => {
          console.error('Erreur dans le flux des mises à jour:', err);
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
