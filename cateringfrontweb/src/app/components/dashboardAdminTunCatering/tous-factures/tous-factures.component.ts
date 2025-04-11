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
  BonsLivraison: string[];
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
  connectionStatus: boolean = false;
  loading: boolean = true;
  error: string | null = null;
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
    this.monitorConnectionStatus();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  loadFactures() {
    this.loading = true;
    this.factureService.getAllFactures().subscribe({
        next: (facture: any[]) => {
            this.factures = facture;
            this.loading = false;
        },
        error: (err) => {
            console.error('Error loading facture:', err);
            this.error = 'Échec du chargement des factures';
            this.loading = false;
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
      this.factureService.getNewFactures().subscribe({
        next: (f: any) => {
          console.log('Nouvelle facture reçue:', f);
          this.factures.unshift(this.transformFacture(f));
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles factures:', err);
          this.error = 'Erreur de réception des nouvelles factures';
        }
      })
    );
  }

  monitorConnectionStatus() {
    this.subscriptions.add(
      this.factureService.getConnectionStatus().subscribe((status: boolean) => {
        this.connectionStatus = status;
        this.error = status ? null : 'Connexion perdue. Reconnexion...';
      })
    );
  }

}
