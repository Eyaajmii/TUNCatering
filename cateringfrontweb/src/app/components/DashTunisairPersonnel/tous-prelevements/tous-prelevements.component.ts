import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../services/facture.service';
export interface Prelevement {
  _id?: string;
  personnel:string;
  montantTotal:number;
  dateDebut:Date;
  dateFin:Date;
}
@Component({
  selector: 'app-tous-prelevements',
  imports: [CommonModule],
  templateUrl: './tous-prelevements.component.html',
  styleUrl: './tous-prelevements.component.css'
})
export class TousPrelevementsComponent implements OnInit{
  prelevements:Prelevement[]=[];
  constructor(private prelevementService:FactureService){}
  ngOnInit(): void {
    this.prelevementService.lesPrelevement().subscribe({
      next: (p:any[])=>{
        this.prelevements = p
      },
      error: (err) => {
        console.error('Erreur lors de chargement des prelevements:', err);
      }
    })
  }

}
