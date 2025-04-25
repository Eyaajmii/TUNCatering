import { Component } from '@angular/core';
import { FactureService } from '../../../services/facture.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-creer-prelevemnt',
  imports: [CommonModule,FormsModule],
  templateUrl: './creer-prelevemnt.component.html',
  styleUrl: './creer-prelevemnt.component.css'
})
export class CreerPrelevemntComponent {
  dateDebut:string='';
  dateFin:string='';
  prelevement:any=null;
  constructor(private prelevementService:FactureService){}
  OnSoumettre():void{
    this.prelevementService.ajouterPrelevement(this.dateDebut,this.dateFin).subscribe({
      next: (response) => {
        this.prelevement = response.data;
        console.log('Prelevement ajouté avec succès:', response),
        alert('Prelevement ajouté avec succès');
    },
    error: (error) => {
      console.error('Erreur lors de l\'ajout du prélèvement:', error);
    }
  })
  }
}
