import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarnetSanteService } from '../../../services/carnet-sante.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modifier-carnet',
  imports: [FormsModule,CommonModule],
  templateUrl: './modifier-carnet.component.html',
  styleUrl: './modifier-carnet.component.css'
})
export class ModifierCarnetComponent implements OnInit {
  carnetSante: any = {
    Allergies: [],
    Maladie: [],
    Medicaments: [],
    Commentaires: []
  };

  AllergieInput: string = '';
  MaladieInput: string = '';
  MedicamentInput: string = '';
  CommentaireInput: string = '';
  constructor(private carnetService:CarnetSanteService, private router: Router) {}

  ngOnInit(): void {
    this.carnetService.AfficherCarnetSante().subscribe({
      next: (res) => {
        this.carnetSante = res.carnet;
      },
      error: (err) => {
        console.error('Erreur de récupération du carnet :', err);
      }
    });
  }

  ajouterChamp(type: string, valeur: string) {
    if (!valeur.trim()) return;
    this.carnetSante[type].push(valeur.trim());
    if (type === 'Allergies') this.AllergieInput = '';
    if (type === 'Maladie') this.MaladieInput = '';
    if (type === 'Medicaments') this.MedicamentInput = '';
    if (type === 'Commentaires') this.CommentaireInput = '';
  }

  supprimerChamp(type: string, index: number) {
    this.carnetSante[type].splice(index, 1);
  }

  enregistrerModifications() {
    this.carnetService.ModifierCarnetSante(this.carnetSante).subscribe({
      next: () => {
        alert('Carnet modifié avec succès');
        this.router.navigate(['/AccueilPersonnel/MonCarnet']);
      },
      error: (err) => {
        console.error('Erreur de modification :', err);
      }
    });
  }
  retour(){
    this.router.navigate(['/AccueilPersonnel/'])
  }
}