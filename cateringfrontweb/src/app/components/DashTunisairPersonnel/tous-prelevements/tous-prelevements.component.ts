import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../services/facture.service';
export interface Prelevement {
  _id: string;
  personnel:string;
  montantTotal:number;
  dateDebut:Date;
  dateFin:Date;
  annulation:Boolean
}
@Component({
  selector: 'app-tous-prelevements',
  imports: [CommonModule],
  templateUrl: './tous-prelevements.component.html',
  styleUrl: './tous-prelevements.component.css'
})
export class TousPrelevementsComponent implements OnInit{
  prelevements:Prelevement[]=[];
  selectedPrelevId: string | null = null;
  selectedPrelevDetail: any = null;
  constructor(private prelevementService:FactureService){}
  ngOnInit(): void {
    this.laodPrelevement();
  }
  laodPrelevement(){
    this.prelevementService.lesPrelevement().subscribe({
      next: (p:any[])=>{
        this.prelevements = p
      },
      error: (err) => {
        console.error('Erreur lors de chargement des prelevements:', err);
      }
    })
  }
  AnnulerPrelevement(id:string| undefined){
    if (id) {
      const confirmation = confirm("Voulez-vous vraiment annuler ce prélevement ?");
      if (confirmation) {
        this.prelevementService.annulerPrelevement(id).subscribe({
          next: () => {
            this.laodPrelevement();
            alert('Prélevement annulée avec succès.');
          },
          error: (error) => {
            if (error.error && typeof error.error === 'string') {
              alert(error.error);
            } else if (error.error && error.error.message) {
              alert(error.error.message);
            } else {
              alert('Erreur lors de l\'annulation.');
            }
            console.error(error);
          }
        });
      }
    }
  }
  toggleDetails(id: string) {
    if (this.selectedPrelevId === id) {
      this.selectedPrelevId = null;
      this.selectedPrelevDetail = null;
    } else {
      this.selectedPrelevId = id;
      this.prelevementService.detailPrelevement(id).subscribe({
        next: (data) => {
          this.selectedPrelevDetail = data;
        },
        error: () => {
          this.selectedPrelevDetail = null;
        }
      });
    }
  }
}
