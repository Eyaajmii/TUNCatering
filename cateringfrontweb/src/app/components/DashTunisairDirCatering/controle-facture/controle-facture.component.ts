import { Component, OnDestroy, OnInit } from '@angular/core';
import { FactureService } from '../../../services/facture.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export interface Facture {
  _id: string;
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
  selector: 'app-controle-facture',
  imports: [CommonModule,FormsModule],
  templateUrl: './controle-facture.component.html',
  styleUrl: './controle-facture.component.css'
})
export class ControleFactureComponent implements OnInit, OnDestroy {
  factures:Facture[]=[];
  selectedStatut: string = 'Tous';
  connectionStatus: boolean = false;
  loading: boolean = true;
  error: string | null = null;
  readonly availableStatuses = [
    { value: 'en attente', display: 'En attente', class: 'en-attente' },
    { value: 'confirmé', display: 'confirmé', class: 'confirmé' },
    { value: 'annulé', display: 'annulé', class: 'annule' },
  ];
  
  private subscriptions: Subscription = new Subscription(); 
  constructor(private factureService:FactureService){}
  ngOnInit(): void {
    this.factureService.joinRoom('Direction_Catering_Tunisair');
    this.loadFactures();
    this.setupWebSocketListeners();
  
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
      this.factureService.onNewFacture().subscribe({
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
    this.subscriptions.add(
      this.factureService.onFactureStatusUpdate().subscribe(update => {
        const index = this.factures.findIndex(c => c._id === update._id);
        if (index !== -1) {
          this.factures[index].Statut = update.Statut;
        }
      })
    );
  }

  changerStatut(id: string, nouveauStatut: string) {
    if (!this.availableStatuses.some(s => s.value === nouveauStatut)) {
      this.error = 'Statut invalide';
      return;
    }

    this.factureService.ModifierStatut(id, nouveauStatut).subscribe({
      next: (response) => {
        console.log('Statut mis à jour avec succès:', response);
        const index = this.factures.findIndex(c => c._id === id);
        if (index !== -1) {
          this.factures[index].Statut = nouveauStatut;
        }
      },
      error: (err) => {
        console.error('Échec de la mise à jour du statut:', err);
        this.error = 'Échec de la mise à jour du statut';
      }
    });
  }
  formatId(id: string): string {
    return id?.substring(0, 8) || 'N/A';
  }
  formatDateTime(dateString: string | Date): string {
    if (!dateString) return 'Date invalide';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
  
    // Options pour le formatage
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    };
  
    const formattedDate = date.toLocaleDateString('fr-FR', dateOptions);
    const formattedTime = date.toLocaleTimeString('fr-FR', timeOptions);
  
    return `${formattedDate} à ${formattedTime}`;
  }
  getStatusClass(status: string): string {
    const found = this.availableStatuses.find(s => s.value === status);
    return found ? 'status-' + found.class : '';
  }
  get FacturesFiltres(): Facture[] {
    if (this.selectedStatut === 'Tous') {
      return this.factures;
    }
    return this.factures.filter(f => f.Statut === this.selectedStatut);
  }
}
