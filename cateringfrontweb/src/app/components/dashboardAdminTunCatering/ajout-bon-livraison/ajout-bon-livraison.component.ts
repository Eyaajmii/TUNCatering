import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BonLivraisonService } from '../../../services/bon-livraison.service';
import { CommandeServiceService } from '../../../services/commande-service.service';

@Component({
  selector: 'app-ajout-bon-livraison',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './ajout-bon-livraison.component.html',
  styleUrl: './ajout-bon-livraison.component.css'
})
export class AjoutBonLivraisonComponent implements OnInit {
  //numVol: string = '';
  vols:any[]=[];
  commandes: any[] = [];
  errorMessage: string = '';
  selectedCommandes: string[] = [];
  personnelLivraisonId: string = ''; 
  BnFrom:FormGroup;
  constructor(
    private commandeService: CommandeServiceService,
    private bonLivraisonService: BonLivraisonService,
    private fb: FormBuilder
  ) {
    this.BnFrom=this.fb.group({
      'numVol':[''],
    })
  }
  ngOnInit(): void {
    this.commandeService.getVols().subscribe(vols => {
      console.log(vols);
      this.vols = vols.map(vol => ({
          ...vol,
          numVol: vol.numVol.trim()
        }));
    });
  }

  searchCommandes(): void {
    this.commandeService.getCommandesByVol(this.BnFrom.value.numVol).subscribe({
      next: (response) => {
        console.log("Response from API:", response);
        if (response && response.success) {
          this.commandes = response.data;
          this.selectedCommandes = this.commandes.map(commande => commande._id);
          this.errorMessage = '';
        } else {
          this.errorMessage = `Aucune commande trouvée pour le vol ${this.BnFrom.value.numVol}`;
          this.commandes = [];
        }
      },
      error: (err) => {
        console.error("Erreur dans la récupération des commandes:", err);
        this.errorMessage = "Erreur lors de la récupération des commandes.";
        this.commandes = [];
      }
    });
  }

  createBonLivraison(): void {
    if (this.selectedCommandes.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins une commande.';
      return;
    }

    const bonLivraisonData: any = {
      numeroBon: `BL-${new Date().getFullYear()}-${(Math.random() * 10000).toFixed(0)}`, 
      volId: this.BnFrom.value.numVol,
      commandes: this.selectedCommandes,
    };

    if (this.personnelLivraisonId.trim()) {
      bonLivraisonData.personnelLivraison = this.personnelLivraisonId;
    }

    // Créer le bon de livraison
    this.bonLivraisonService.createBonLivraison(bonLivraisonData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Bon de Livraison créé avec succès!');
          
          // Télécharger le PDF après la création du bon de livraison
          this.downloadPdf(response.data.numeroBon);
        } else {
          this.errorMessage = 'Erreur lors de la création du Bon de Livraison.';
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur serveur';
      }
    });
  }

  private downloadPdf(numeroBon: string): void {
    this.bonLivraisonService.downloadPdf(numeroBon).subscribe({
      next: (blob: Blob) => {
        // Créer un objet URL pour le blob
        const url = window.URL.createObjectURL(blob);
        
        // Créer un lien et déclencher le téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.download = `bon_livraison_${numeroBon}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          link.remove();
        }, 100);
      },
      error: (err) => {
        console.error('Erreur de téléchargement:', err);
        alert('PDF généré mais erreur lors du téléchargement');
      }
    });
  }
}
