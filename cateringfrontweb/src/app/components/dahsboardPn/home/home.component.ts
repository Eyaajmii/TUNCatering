import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';
import { ChatbotService } from '../../../services/chatbot.service';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-home',
  imports: [CommonModule,FormsModule,CarouselModule,ButtonModule,
    TagModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  //chat
  isChatOpen = false;
  userInput = '';
  messages: { sender: string, text: string ,timestamp: string}[] = [];
  //Pageacceuil
 // activetab:string='entree';
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
  constructor(private menuService:MenuServiceService,private platService:PlatServiceService,private router:Router,private chatbotService: ChatbotService){}
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
  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }
  send(): void {
    const input = this.userInput.trim();
    if (!input) return;
    this.messages.push({ sender: 'Vous', text: input,timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })});
    this.userInput = '';
    this.chatbotService.EnvoyerMessage(input).subscribe(response => {
      this.messages.push({ sender: 'Bot', text: response.reply ,timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })});
    });
  }
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

}
