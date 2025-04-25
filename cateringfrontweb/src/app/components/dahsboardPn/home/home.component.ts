import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  //chatbot
  isPopupOpen: boolean = false;
  isPanelOpen: boolean = false;
  //Pageacceuil
  activetab:string='entree';
  menus:Menu[]=[];
  plats:Plat[]=[];
  PlatsEntree:Plat[]=[];
  PlatsPrincipaux:Plat[]=[];
  PlatsDessert:Plat[]=[];
  Boissons:Plat[]=[];
  Petitdejuner:Plat[]=[];
  //Selected meals
  EntreeSelectionne:Plat|null=null;
  PrincipauxSelectionne:Plat|null=null;
  DessertSelectionne:Plat|null=null;
  BoissonsSelectionne:Plat|null=null;
  DejunerSelectionne:Plat[]=[];
  constructor(private menuService:MenuServiceService,private platService:PlatServiceService,private router:Router){}
  ngOnInit(): void {
    this.menuService.TousMenu().subscribe(data => {
      console.log("Données des menus reçues :", data);
      this.menus = data;
    });

    this.platService.getallPlats().subscribe(data=>{
      this.plats=data;
      this.PlatsEntree=this.plats.filter(plat=>plat.typePlat==="Entrée");
      this.PlatsPrincipaux=this.plats.filter(plat=>plat.typePlat==="Plat Principal");
      this.PlatsDessert=this.plats.filter(plat=>plat.typePlat==="Dessert");
      this.Boissons=this.plats.filter(plat=>plat.typePlat==="Boisson");
      this.Petitdejuner=this.plats.filter(plat=>plat.typePlat==="Petit déjuner");
    });
  }
  commanderMenu(nom:string):void{
    this.router.navigate(['/AccueilPersonnel/commandeMenu'],{queryParams:{Menu:nom}});
  }
  //deactiverLesautresplats
  SelectedMeal(p: Plat, typePlat: string) {
    if (typePlat === "Entrée") {
      this.EntreeSelectionne = p;
    } else if (typePlat === 'Plat Principal') {
      this.PrincipauxSelectionne = p;
    } else if (typePlat === 'Dessert') {
      this.DessertSelectionne = p;
    } else if (typePlat === 'Boisson') {
      this.BoissonsSelectionne = p;
    } else if (typePlat === 'Petit déjuner') {
      const index = this.DejunerSelectionne.findIndex(d => d._id === p._id);
      if (index > -1) {
        this.DejunerSelectionne.splice(index, 1); // Supprimer si déjà présent
      } else if (this.DejunerSelectionne.length < 3) {
        this.DejunerSelectionne.push(p);
      }
    }
  }
  
   // Affichage du bouton panier
   afficherButtonPanier(): boolean {
    const selectionDej = this.DejunerSelectionne.length;

    // Cas petit déjeuner uniquement
    if (selectionDej > 0 && selectionDej <= 3 && !this.EntreeSelectionne && !this.PrincipauxSelectionne && !this.DessertSelectionne) {
      return true;
    }

    // Cas 3 plats classiques
    if (this.EntreeSelectionne && this.PrincipauxSelectionne && this.DessertSelectionne) {
      return true;
    }

    // Cas 4 plats incluant boisson
    const count = 
      (this.EntreeSelectionne ? 1 : 0) +
      (this.PrincipauxSelectionne ? 1 : 0) +
      (this.DessertSelectionne ? 1 : 0) +
      (this.BoissonsSelectionne ? 1 : 0);
    return count === 4;
  }

  allerAuPanier(): void {
    const petitDejNoms = this.DejunerSelectionne.map(p => p.nom).join(',');
    this.router.navigate(['/AccueilPersonnel/PanierPlats'], { queryParams: {
    Entree: this.EntreeSelectionne?.nom || '',
    Principaux: this.PrincipauxSelectionne?.nom || '',
    Dessert: this.DessertSelectionne?.nom || '',
    Boissons: this.BoissonsSelectionne?.nom || '',
    PetitDej: petitDejNoms
    }

     });
  }

  //chatbot
  // Ouvrir le chatbox
  openChatbox() {
    console.log('Opening Chatbox...');
    this.isPopupOpen = true;
    this.isPanelOpen = false;  // Assurez-vous que le panel est fermé lorsque le popup est ouvert
    console.log('isPopupOpen:', this.isPopupOpen);
    console.log('isPanelOpen:', this.isPanelOpen);
  }

  // Fermer le chatbox
  closeChatbox() {
    console.log('Closing Chatbox...');
    this.isPopupOpen = false;
    console.log('isPopupOpen:', this.isPopupOpen);
  }

  // Maximiser le chatbox pour passer au panel
  maximizeChat() {
    console.log('Maximizing Chat...');
    this.isPopupOpen = false;
    this.isPanelOpen = true;
    console.log('isPopupOpen:', this.isPopupOpen);
    console.log('isPanelOpen:', this.isPanelOpen);
  }

  // Minimiser le chatbox et revenir au popup
  minimizeChat() {
    console.log('Minimizing Chat...');
    this.isPanelOpen = false;
    this.isPopupOpen = true;
    console.log('isPopupOpen:', this.isPopupOpen);
    console.log('isPanelOpen:', this.isPanelOpen);
  }

  // Fermer le panel
  closePanel() {
    console.log('Closing Panel...');
    this.isPanelOpen = false;
    this.isPopupOpen = true;  // Rouvre le popup si le panel est fermé
    console.log('isPopupOpen:', this.isPopupOpen);
    console.log('isPanelOpen:', this.isPanelOpen);
  }
  
}
