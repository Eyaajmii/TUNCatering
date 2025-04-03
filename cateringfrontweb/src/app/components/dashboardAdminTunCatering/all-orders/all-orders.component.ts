import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Plat {
  _id: string;
  nom: string;
  typePlat: string;
  prix: number;
  description?: string;
}

interface Commande {
  _id: string;
  Statut: string;
  plats: Plat[];
  dateCommnade: Date;
  // Add other fields from your model as needed
}

@Component({
  selector: 'app-all-orders',
  imports: [CommonModule,FormsModule],
  templateUrl: './all-orders.component.html',
  styleUrl: './all-orders.component.css'
})
export class AllOrdersComponent  implements OnInit, OnDestroy {
  commandes: Commande[] = [];
  filtres = { statut: 'tous' };
  connectionStatus: boolean = false;
  loading: boolean = true;
  error: string | null = null;

  readonly availableStatuses = [
    { value: 'en attente', display: 'En attente', class: 'en-attente' },
    { value: 'en cours de préparation', display: 'En préparation', class: 'en-preparation' },
    { value: 'traité', display: 'Traité', class: 'traite' },
    { value: 'annulé', display: 'Annulé', class: 'annule' },
    { value: 'en retard', display: 'En retard', class: 'en-retard' },
    { value: 'livré', display: 'Livré', class: 'livre' }
  ];

  private subscriptions: Subscription = new Subscription();

  constructor(private commandeService: CommandeServiceService) {}

  ngOnInit() {
    this.loadInitialOrders();
    this.setupWebSocketListeners();
    this.monitorConnectionStatus();
  }

  loadInitialOrders() {
    this.loading = true;
    this.commandeService.getInitialOrders().subscribe({
        next: (orders: any[]) => {
            this.commandes = orders;
            this.loading = false;
        },
        error: (err) => {
            console.error('Error loading orders:', err);
            this.error = 'Échec du chargement des commandes';
            this.loading = false;
        }
    });
}

  private transformCommande(commande: any): Commande {
    return {
      ...commande,
      plats: this.transformPlats(commande.plats)
    };
  }

  private transformPlats(plats: any[]): Plat[] {
    if (!plats) return [];
    
    // If plats are already in correct format
    if (plats.length > 0 && typeof plats[0] === 'object' && 'nom' in plats[0]) {
      return plats as Plat[];
    }
    
    // If plats are just IDs (strings)
    return plats.map(plat => ({
      _id: typeof plat === 'string' ? plat : plat._id,
      nom: typeof plat === 'string' ? 'Chargement...' : plat.nom,
      typePlat: typeof plat === 'string' ? 'Inconnu' : plat.typePlat,
      prix: typeof plat === 'string' ? 0 : plat.prix,
      description: typeof plat === 'string' ? '' : plat.description
    }));
  }

  setupWebSocketListeners() {
    this.subscriptions.add(
      this.commandeService.getNewOrders().subscribe({
        next: (commande: any) => {
          console.log('Nouvelle commande reçue:', commande);
          this.commandes.unshift(this.transformCommande(commande));
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles commandes:', err);
          this.error = 'Erreur de réception des nouvelles commandes';
        }
      })
    );

    this.subscriptions.add(
      this.commandeService.getStatusUpdates().subscribe({
        next: (update: any) => {
          const index = this.commandes.findIndex(c => c._id === update._id);
          if (index !== -1) {
            this.commandes[index] = this.transformCommande({
              ...this.commandes[index],
              ...update
            });
          }
        },
        error: (err) => {
          console.error('Erreur dans le flux des mises à jour:', err);
          this.error = 'Erreur de réception des mises à jour';
        }
      })
    );
  }

  monitorConnectionStatus() {
    this.subscriptions.add(
      this.commandeService.getConnectionStatus().subscribe((status: boolean) => {
        this.connectionStatus = status;
        this.error = status ? null : 'Connexion perdue. Reconnexion...';
      })
    );
  }

  getStatusDisplayText(status: string): string {
    const foundStatus = this.availableStatuses.find(s => s.value === status);
    return foundStatus ? foundStatus.display : status;
  }

  getStatusClass(status: string): string {
    const normalized = status.toLowerCase().replace(/\s+/g, '-');
    return `status-${normalized}`;
  }

  changerStatut(commandeId: string, nouveauStatut: string) {
    if (!this.availableStatuses.some(s => s.value === nouveauStatut)) {
      this.error = 'Statut invalide';
      return;
    }

    this.commandeService.updateOrderStatus(commandeId, nouveauStatut).subscribe({
      next: (response) => {
        console.log('Statut mis à jour avec succès:', response);
        const index = this.commandes.findIndex(c => c._id === commandeId);
        if (index !== -1) {
          this.commandes[index].Statut = nouveauStatut;
        }
      },
      error: (err) => {
        console.error('Échec de la mise à jour du statut:', err);
        this.error = 'Échec de la mise à jour du statut';
      }
    });
  }

  get filteredCommands() {
    return this.filtres.statut === 'tous'
      ? this.commandes
      : this.commandes.filter(c => c.Statut === this.filtres.statut);
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}