import { Component } from '@angular/core';
import { FactureService } from '../../../services/facture.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ajout-facture',
  imports: [FormsModule,CommonModule],
  templateUrl: './ajout-facture.component.html',
  styleUrl: './ajout-facture.component.css'
})
export class AjoutFactureComponent {
  dateFacture: string = "";
  facture: any = null;
  erreur: string = "";

  constructor(private factureService: FactureService) {}

  onSubmit() {
    this.facture = null;
    this.erreur = "";

    if (!this.dateFacture) {
      this.erreur = "Veuillez saisir la date de la facture.";
      return;
    }

    this.factureService.ajouterFacture(this.dateFacture).subscribe({
      next: (res) => {
        this.facture = res.data;
      },
      error: (err) => {
        console.error('Erreur lors de la création de la facture :', err);
        this.erreur = "Une erreur est survenue lors de la création de la facture.";
      }
    });
  }
}
