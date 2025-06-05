import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Reclamation, ReclamationServiceService } from '../../../services/reclamation-service.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-tousreclamation',
  imports: [CommonModule,FormsModule],
  templateUrl: './tousreclamation.component.html',
  styleUrl: './tousreclamation.component.css'
})
export class TousreclamationComponent implements OnInit,OnDestroy{
reclamations:Reclamation[]=[];
selectedStatut: string = 'Tous';
connectionStatus: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  readonly availableStatuses = [
    { value: 'en attente', display: 'En attente', class: 'en-attente' },
    { value: 'traité', display: 'traité', class: 'traite' },
    {value:'annulée',display:'annulée',class:'annulee'}
  ];
  private subscriptions: Subscription = new Subscription(); 
  constructor(private reclamationService:ReclamationServiceService){}
  ngOnInit(): void {
    this.loadReclamation();
    this.setupWebSocketListeners();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  loadReclamation(){
    this.loading = true;
    this.reclamationService.getTousReclamations().subscribe({
      next:(response:any)=>{
        this.reclamations=response.reclamations;
        this.loading=false;
      },
      error:(err)=>{
        console.error('Error loading reclamation:', err);
            this.error = 'Échec du chargement des reclamations';
            this.loading = false;
      }
    })
  }
  private transformReclamation(reclamation:any):Reclamation{
    return {
      ...reclamation
    }
  }
  setupWebSocketListeners() {
    this.subscriptions.add(
      this.reclamationService.getNewReclamation().subscribe({
        next: (r: any) => {
          console.log('Nouvelle reclamation reçue:', r);
          this.reclamations.unshift(this.transformReclamation(r));
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles factures:', err);
          this.error = 'Erreur de réception des nouvelles factures';
        }
      })
    );
    this.subscriptions.add(
      this.reclamationService.getStatusUpdate().subscribe(update => {
        const index = this.reclamations.findIndex(c => c._id === update._id);
        if (index !== -1) {
          this.reclamations[index].Statut = update.statut;
          this.reclamations[index].updatedAt = update.updatedAt;
        }
      })
    );
  }
  changer(id: string, nouveauStatut: string,MessageReponse:string){
    if (!this.availableStatuses.some(s => s.value === nouveauStatut)) {
      this.error = 'Statut invalide';
      return;
    }
    this.reclamationService.repondreReclamation(id, nouveauStatut,MessageReponse).subscribe({
      next: (response) => {
        console.log('Statut mis à jour avec succès:', response);
        const index = this.reclamations.findIndex(c => c._id === id);
        if (index !== -1) {
          this.reclamations[index].Statut = nouveauStatut;
        }
      },
      error: (err) => {
        console.error('Échec de la mise à jour du statut:', err);
        this.error = 'Échec de la mise à jour du statut';
      }
    })
  }
  getStatusClass(status: string): string {
    const found = this.availableStatuses.find(s => s.value === status);
    return found ? 'status-' + found.class : '';
  }
  get ReclamationFiltres(): Reclamation[] {
    if (this.selectedStatut === 'Tous') {
      return this.reclamations;
    }
    return this.reclamations.filter(f => f.Statut === this.selectedStatut);
  }
}
