import { Component } from '@angular/core';
import { FactureService } from '../../../services/facture.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BonLivraisonService } from '../../../services/bon-livraison.service';

@Component({
  selector: 'app-ajout-facture',
  imports: [FormsModule,CommonModule],
  templateUrl: './ajout-facture.component.html',
  styleUrl: './ajout-facture.component.css'
})
export class AjoutFactureComponent {
  facture: any = null;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  message: string = "";
  erreur: string = "";

  constructor(private factureService: FactureService) {}

  onSubmit() {
    if (!this.dateDebut || !this.dateFin) {
      this.erreur = "Les deux dates sont obligatoires.";
      this.message = "";
      this.facture = null;
      return;
    }

    this.erreur = "";
    this.message = "";
    this.facture = null;

    this.factureService.ajouterFacture(this.dateDebut, this.dateFin).subscribe({
      next: (res) => {
        this.message = 'Facture créée avec succès !';
        this.facture = res.data;
      },
      error: (error) => {
        const message = error?.error?.message || "Une erreur s'est produite. Veuillez réessayer.";
        alert(message);
      },
    });
  }
}
