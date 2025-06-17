import { Component, OnInit, OnDestroy } from '@angular/core';
import { Commande, CommandeServiceService, Menu, Plat} from '../../../services/commande-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';  
import { saveAs } from 'file-saver'; 

@Component({
  selector: 'app-all-orders',
  imports: [CommonModule,FormsModule],
  templateUrl: './all-orders.component.html',
  styleUrl: './all-orders.component.css'
})
export class AllOrdersComponent implements OnInit,OnDestroy {
  commandes: Commande[] = [];
  filtres = { statut: 'tous' };
  loading = true;
  error: string | null = null;
  readonly availableStatuses = [
    { value: 'en attente', display: 'En attente', class: 'en-attente' },
    { value: 'prêt', display: 'Prête', class: 'pret' },
    { value: 'annulé', display: 'Annulée', class: 'annule' },
    { value: 'en retard', display: 'En retard', class: 'en-retard' },
    { value: 'livré', display: 'Livrée', class: 'livre' },
  ];
  private subscriptions: Subscription = new Subscription();
  EXCEL_TYPE: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';  
  constructor(private commandeService: CommandeServiceService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.setupWebSocketListeners();
  }
  loadOrders():void{
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
  setupWebSocketListeners() {
    this.subscriptions.add(
      this.commandeService.onNewOrder().subscribe({
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
      this.commandeService.onOrderStatusUpdate().subscribe((update) => {
        const index = this.commandes.findIndex(cmd => cmd._id === update.commandeId);
        if (index !== -1) {
          this.commandes[index].Statut = update.Statut;
        }
      })
    );
  }
  private transformCommande(commande: any): Commande {
    return {
      ...commande,
      plats: this.transformPlats(commande.plats)
    };
  }

  private transformPlats(plats: any[]): Plat[] {
    if (!plats) return [];
    // Si les plats sont déjà des objets complets
    if (plats.length > 0 && typeof plats[0] === 'object' && 'nom' in plats[0]) {
      return plats as Plat[];
    }
    // Sinon, transforme les ids en objets plats "placeholder"
    return plats.map(plat => ({
      _id: typeof plat === 'string' ? plat : plat._id,
      nom: typeof plat === 'string' ? 'Chargement...' : plat.nom,
      typePlat: typeof plat === 'string' ? 'Inconnu' : plat.typePlat,
      prix: typeof plat === 'string' ? 0 : plat.prix,
      description: typeof plat === 'string' ? '' : plat.description
    }));
  }
  getStatusDisplayText(status: string): string {
    const foundStatus = this.availableStatuses.find(s => s.value === status);
    return foundStatus ? foundStatus.display : status;
  }

  getStatusClass(status: string): string {
    const found = this.availableStatuses.find(s => s.value === status);
    return found ? 'status-' + found.class : '';
  }

  changerStatut(commandeId: string, nouveauStatut: string): void {
    if (!this.availableStatuses.some(s => s.value === nouveauStatut)) {
      this.error = 'Statut invalide';
      return;
    }
    this.commandeService.updateOrderStatus(commandeId, nouveauStatut).subscribe({
      next: () => {
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

  get filteredCommands(): Commande[] {
    return this.filtres.statut === 'tous'
      ? this.commandes
      : this.commandes.filter(c => c.Statut === this.filtres.statut);
  }

  formatDateTime(dateString: string | Date): string {
    if (!dateString) return 'Date invalide';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

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
  exportToExcel(): void {
    const formatReference = (ref: any) => {
      return ref ? (ref._id ? this.formatId(ref._id) : 'N/A') : 'N/A';
    };
  
    const formattedCommands = this.commandes.map(commande => ({
      'ID': this.formatId(commande._id),
      'Nombre de Commandes': commande.NombreCommande,
      'Statut': this.getStatusDisplayText(commande.Statut), 
      'Date de Commande': this.formatDateTime(commande.dateCommnade),
      'Matricule': formatReference(commande.Matricule),
      'Vol ID': formatReference(commande.vol),
      'Menu ID': formatReference(commande.menu),
      'Plats IDs': commande.plats?.length 
        ? commande.plats.map(plat => formatReference(plat)).join(', ') 
        : 'Aucun'
    }));
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedCommands);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes');
  
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: this.EXCEL_TYPE });
    saveAs(data, 'commandes_' + new Date().toISOString().slice(0,10) + '.xlsx');
  }
  formatId(id: string): string {  
    return id.substring(0, 8).toUpperCase();  
} 
}
