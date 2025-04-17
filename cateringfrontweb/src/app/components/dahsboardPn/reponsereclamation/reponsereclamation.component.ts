import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReclamationServiceService } from '../../../services/reclamation-service.service';
import { CommonModule } from '@angular/common';
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
  selector: 'app-reponsereclamation',
  imports: [CommonModule],
  templateUrl: './reponsereclamation.component.html',
  styleUrl: './reponsereclamation.component.css'
})
export class ReponsereclamationComponent implements OnInit {
  reclamation:Reclamation|null=null;
  reclamationId: string = '';
  constructor(private route:ActivatedRoute,private reclamationservice:ReclamationServiceService){}
  ngOnInit(): void {
    this.reclamationId = this.route.snapshot.paramMap.get('id') || '';    if (this.reclamationId) {
      this.loadReclamationDetails(this.reclamationId);
    }
  }
  loadReclamationDetails(id: string) {
    this.reclamationservice.getDetailreclamation(id).subscribe({
      next: (res: any) => {
        this.reclamation = res.reclamation;
        console.log("Reclamation details:", this.reclamation);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la réclamation', err);
      }
    });
  }

}
