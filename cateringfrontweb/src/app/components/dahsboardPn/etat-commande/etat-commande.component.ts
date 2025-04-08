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
  matriculePn: string = '';
  subscriptions: Subscription[] = [];

  constructor(private commandeService: CommandeServiceService) {}

  ngOnInit(): void {
    const newOrderSub = this.commandeService.getNewOrders().subscribe(newOrder => {
      if (newOrder.MatriculePn === this.matriculePn) {
        this.commandes.push(newOrder);
      }
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

  onMatriculeChange(): void {
    if (this.matriculePn && this.matriculePn.trim() !== '') {
      this.commandeService.getMyOrders(this.matriculePn.trim()).subscribe(d => {
        this.commandes = d || [];
      });
    } else {
      this.commandes = [];
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
