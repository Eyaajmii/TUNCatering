import { Component, OnInit } from '@angular/core';
import { CarnetSanteService } from '../../../services/carnet-sante.service';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-carnet-sante',
  imports: [CommonModule],
  templateUrl: './carnet-sante.component.html',
  styleUrl: './carnet-sante.component.css'
})
export class CarnetSanteComponent implements OnInit {
  carnetSante:any=null;
  constructor(private carnet:CarnetSanteService,private router:Router){}
  ngOnInit(): void {
    this.carnet.AfficherCarnetSante().subscribe({
      next:(res)=>{
        this.carnetSante=res.carnet;
      },
      error:(err)=>{
        console.error('Erreur de récupération du carnet :', err);
      }
    })
  }
  Ajouter(){
    this.router.navigate(['/AccueilPersonnel/CarnetSante'])
  }
  Supprimer(){
      if (confirm('Voulez-vous vraiment supprimer ce carnet ?')) {
        this.carnet.AnnulerCarnetSante().subscribe({
          next: () => {
            this.carnetSante = null;
            alert('Carnet supprimé avec succès.');
          },
          error: (err) => {
            console.error('Erreur de suppression :', err);
          }
        });
      }
  }
  Modifier(){
    this.router.navigate(['/AccueilPersonnel/ModifierCarnet'])
  }
}
