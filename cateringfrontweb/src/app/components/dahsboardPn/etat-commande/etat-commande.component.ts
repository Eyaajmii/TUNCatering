import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Commande, CommandeServiceService } from '../../../services/commande-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-etat-commande',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etat-commande.component.html',
  styleUrls: ['./etat-commande.component.css']
})
export class EtatCommandeComponent implements OnInit, OnDestroy {
  commandes: Commande[] = [];
  private subscriptions: Subscription = new Subscription();
  statusFilters = [
    { name: 'en attente', selected: false, count: 0 },
    { name: 'prêt', selected: false, count: 0 },
    { name: 'en retard', selected: false, count: 0 },
    { name: 'livré', selected: false, count: 0 },
    { name: 'annulé', selected: false, count: 0 }
  ];
  selectedDate?: string;

  constructor(
    private commandeService: CommandeServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
    this.setupWebSocketListeners();
    this.subscriptions.add(
      this.commandeService.onOrderStatusUpdate().subscribe((update) => {
        const index = this.commandes.findIndex(cmd => cmd._id === update.commandeId);
        if (index !== -1) {
          this.commandes[index].Statut = update.Statut;
        }
      })
    );
  }

  loadCommandes(): void {
    this.commandeService.getMyOrders().subscribe({
      next: (data:any[]) => {
        this.commandes = data;
        this.updateStatusCounts();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des commandes:', err);
      }
    });
  }
setupWebSocketListeners() {
    this.subscriptions.add(
      this.commandeService.onNewOrder().subscribe({
        next: (commande: any) => {
          this.commandes.push(commande);
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles commandes:', err);
        }
      })
    );
    /*this.subscriptions.add(
      this.commandeService.onOrderStatusUpdate().subscribe(update => {
        const index = this.commandes.findIndex(c => c._id === update._id);
        if (index !== -1) {
          this.commandes[index].Statut = update.Statut;
          this.commandes[index].updatedAt = update.updatedAt;
        }
      })
    );*/
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get filtreCommande(): any[] {
    let filtres = this.commandes;
    const selectedStatuses = this.statusFilters.filter(s => s.selected).map(s => s.name);

    if (selectedStatuses.length > 0) {
      filtres = filtres.filter(c => selectedStatuses.includes(c.Statut));
    }

    if (this.selectedDate) {
      filtres = filtres.filter(c => {
        const commandeDate = new Date(c.dateCommnade).toISOString().split('T')[0];
        return commandeDate === this.selectedDate;
      });
    }

    return filtres;
  }

  updateStatusCounts(): void {
    this.statusFilters.forEach(filter => {
      filter.count = this.commandes.filter(c => c.Statut === filter.name).length;
    });
  }

  modifier(id?: string): void {
    if (id) {
      this.router.navigate(['/AccueilPersonnel/ModifierCommande', id]);
    }
  }

  annuler(id?: string): void {
    if (id) {
      const confirmation = confirm("Voulez-vous vraiment annuler cette commande ?");
      if (confirmation) {
        this.commandeService.AnnulerCommande(id).subscribe({
          next: () => {
            this.loadCommandes();
          },
          error: (error) => {
            alert('Erreur lors de l\'annulation.');
            console.error(error);
          }
        });
      }
    }
  }
}
