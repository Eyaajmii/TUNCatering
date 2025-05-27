import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Reclamation, ReclamationServiceService } from '../../../services/reclamation-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-consulter-reclamation',
  imports: [CommonModule,FormsModule],
  templateUrl: './consulter-reclamation.component.html',
  styleUrl: './consulter-reclamation.component.css'
})
export class ConsulterReclamationComponent implements OnInit,OnDestroy{
  reclamations:Reclamation[]=[];
  MatriculePn:string='';
  private subscriptions: Subscription = new Subscription(); 
  constructor(private reclamationservice:ReclamationServiceService,private route:ActivatedRoute,private router:Router) { }
  ngOnInit(): void {
    this.loadReclamation();
    this.setupWebSocketListeners();
  }
  loadReclamation(){
    this.reclamationservice.getMesReclamations().subscribe({
      next:(response:any)=>{
        this.reclamations=response.reclamations;
      },
      error:(err)=>{
        console.error('Error loading reclamation:', err);
      }
    })
  }
  setupWebSocketListeners() {
    this.subscriptions.add(
      this.reclamationservice.getNewReclamation().subscribe({
        next: (r: any) => {
          console.log('Nouvelle reclamation reçue:', r);
          this.reclamations.unshift(this.transformReclamation(r));
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles factures:', err);
        }
      })
    );
    this.subscriptions.add(
      this.reclamationservice.getStatusUpdate().subscribe(update => {
        const index = this.reclamations.findIndex(c => c._id === update._id);
        if (index !== -1) {
          this.reclamations[index].Statut = update.Statut;
          this.reclamations[index].MessageReponse = update.MessageReponse;
        }
      })
    );
  }
  private transformReclamation(reclamation:any):Reclamation{
    return {
      ...reclamation
    }
  }
  voirDetails(id: string) {
    this.router.navigate(['/AccueilPersonnel/reponse/', id]);
  }
  Modifier(id:string){
    this.router.navigate(['/AccueilPersonnel/modifierReclamation/', id]);
  }
  Annuler(id:string){
    if (confirm('Voulez-vous vraiment supprimer cette réclamation ?')) {
      this.reclamationservice.annulerReclamation(id).subscribe({
        next: () => {
          alert('Reclamtion annulée avec succès.');
        },
        error: (err) => {
          console.error('Erreur de suppression :', err);
        }
      });
    }
  }
  Ajouter(){
    this.router.navigate(['/AccueilPersonnel/Ajoutreclamation'])
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
