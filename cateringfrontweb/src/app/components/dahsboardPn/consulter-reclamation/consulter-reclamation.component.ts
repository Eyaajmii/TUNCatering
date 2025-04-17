import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReclamationServiceService } from '../../../services/reclamation-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export interface Reclamation{
  _id:string,
  Objet:string,
  MessageEnvoye:string,
  MessageReponse:string,
  Statut: string,
  MatriculePn: string,
  MatriculeDirTunCater: string,
  dateSoumission:string
}

@Component({
  selector: 'app-consulter-reclamation',
  imports: [CommonModule,FormsModule],
  templateUrl: './consulter-reclamation.component.html',
  styleUrl: './consulter-reclamation.component.css'
})
export class ConsulterReclamationComponent implements OnInit,OnDestroy{
  reclamations:Reclamation[]=[];
  MatriculePn:string='';
  subscriptions: Subscription[] = [];
  constructor(private reclamationservice:ReclamationServiceService,private route:ActivatedRoute,private router:Router) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.MatriculePn = params['matricule'];
      if (this.MatriculePn) {
        this.onMatriculeChange();
      }
    });

    const newReclamation=this.reclamationservice.getNewReclamation().subscribe(rec=>{
      if(rec.MatriculePn===this.MatriculePn){
        this.reclamations.push(rec);
      }
    });
    const updateReclamation=this.reclamationservice.getStatusUpdate().subscribe(update=>{
      const i=this.reclamations.findIndex(r=>r._id===update._id);
      if(i!==-1){
        this.reclamations[i].Statut=update.statut;
        this.reclamations[i].dateSoumission=update.updatedAt;
      }
    });
    this.subscriptions.push(newReclamation,updateReclamation);
  }
  onMatriculeChange(): void {
    if (this.MatriculePn && this.MatriculePn.trim() !== '') {
      this.reclamationservice.getMesReclamations(this.MatriculePn.trim()).subscribe({
        next:(response:any)=>{
          this.reclamations=response.reclamations;
        },
        error:(err)=>{
          console.error('Error loading reclamation:', err);
          alert('erreurrrrr')
        }
      });
    } else {
      this.reclamations = [];
    }
  }
  voirDetails(id: string) {
    this.router.navigate(['/AccueilPersonnel/reponse/', id]);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
