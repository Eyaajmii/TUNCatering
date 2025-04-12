import { Component, OnInit } from '@angular/core';
import { BonLivraisonService } from '../../../services/bon-livraison.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bon-livraison',
  templateUrl: './bon-livraison.component.html',
    imports: [CommonModule,FormsModule],

  styleUrls: ['./bon-livraison.component.css']
})
export class BonLivraisonComponent implements OnInit {
  bonsLivraison: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private bonLivraisonService: BonLivraisonService) { }

  ngOnInit(): void {
    this.loadBonsLivraison();
  }

  loadBonsLivraison(): void {
    this.loading = true;
    this.error = null;
    this.bonLivraisonService.getAllBonsLivraison().subscribe(
      (response: any) => {
        if (response.success) {
          this.bonsLivraison = response.data;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors du chargement des bons de livraison';
        this.loading = false;
      }
    );
  }
}