import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-etat-commande',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etat-commande.component.html',
  styleUrls: ['./etat-commande.component.css']
})
export class EtatCommandeComponent implements OnInit, OnDestroy {
  commandes: any[] = [];
  subscriptions: Subscription[] = [];

  constructor(private commandeService: CommandeServiceService) {}

  ngOnInit(): void {
    this.commandeService.getMyOrders().subscribe({
      next: (data) => {
        this.commandes = data;
        console.log('Commandes reçues:', data);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des commandes:', err);
      }
    });
    const newOrderSub = this.commandeService.getNewOrders().subscribe(newOrder => {
        this.commandes.push(newOrder);
    });

    const statusUpdateSub = this.commandeService.getStatusUpdates().subscribe(update => {
      const index = this.commandes.findIndex(c => c._id === update._id);
      if (index !== -1) {
        this.commandes[index].Statut = update.statut;
        this.commandes[index].updatedAt = update.updatedAt;
      }
    });

    this.subscriptions.push(newOrderSub, statusUpdateSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
