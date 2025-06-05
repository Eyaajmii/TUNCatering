import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Menu, Plat, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatbotService } from '../../../services/chatbot.service';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';

interface ExtendedMenu extends Menu {
  favorited: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CarouselModule, ButtonModule, TagModule, ToastModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') chatMessages!: ElementRef;

  // Chat properties
  isChatOpen = false;
  userInput = '';
  isBotTyping = false;
  messages: { sender: string; text: string; timestamp: string }[] = [];

  // Menu and plats properties
  menus: ExtendedMenu[] = [];
  plats: Plat[] = [];
  PlatsEntree: Plat[] = [];
  PlatsPrincipaux: Plat[] = [];
  PlatsDessert: Plat[] = [];
  Boissons: Plat[] = [];
  Petitdejuner: Plat[] = [];

  // Selected meals
  EntreeSelectionne: Plat | null = null;
  PrincipauxSelectionne: Plat | null = null;
  DessertSelectionne: Plat | null = null;
  BoissonsSelectionne: Plat | null = null;
  DejunerSelectionne: Plat[] = [];

  // Carousel responsive options
  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
    { breakpoint: '768px', numVisible: 2, numScroll: 2 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 }
  ];

  constructor(
    private menuService: MenuServiceService,
    private router: Router,
    private chatbotService: ChatbotService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.menuService.TousMenu().subscribe({
      next: (data) => {
        console.log('Données des menus reçues :', JSON.stringify(data, null, 2));
        this.menus = data.map(menu => ({
          ...menu,
          favorited: false,
          PlatsEntree: menu.PlatsEntree || [],
          PlatsPrincipaux: menu.PlatsPrincipaux || [],
          PlatsDessert: menu.PlatsDessert || [],
          Boissons: menu.Boissons || []
        })) as ExtendedMenu[];
        // Log image URLs for debugging
        this.menus.forEach(menu => {
          console.log(`Menu: ${menu.nom}`);
          console.log(`Entrée Image: ${menu.PlatsEntree[0]?.image || 'N/A'}`);
          console.log(`Plat Principal Image: ${menu.PlatsPrincipaux[0]?.image || 'N/A'}`);
          console.log(`Dessert Image: ${menu.PlatsDessert[0]?.image || 'N/A'}`);
          console.log(`Boisson Image: ${menu.Boissons[0]?.image || 'N/A'}`);
          if (!menu.PlatsEntree[0]?.image || !menu.PlatsPrincipaux[0]?.image || !menu.PlatsDessert[0]?.image || !menu.Boissons[0]?.image) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Données manquantes',
              detail: `Images manquantes pour le menu ${menu.nom}. Vérifiez les données du serveur.`
            });
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des menus :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des menus. Veuillez réessayer.'
        });
      }
    });

    this.menuService.TousEntree().subscribe({
      next: (data) => {
        this.PlatsEntree = data;
        console.log('Entrées reçues :', JSON.stringify(data, null, 2));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des entrées :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des entrées. Veuillez réessayer.'
        });
      }
    });

    this.menuService.TousPrincipaux().subscribe({
      next: (data) => {
        this.PlatsPrincipaux = data;
        console.log('Plats principaux reçus :', JSON.stringify(data, null, 2));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des plats principaux :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des plats principaux. Veuillez réessayer.'
        });
      }
    });

    this.menuService.TousDessert().subscribe({
      next: (data) => {
        this.PlatsDessert = data;
        console.log('Desserts reçus :', JSON.stringify(data, null, 2));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des desserts :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des desserts. Veuillez réessayer.'
        });
      }
    });

    this.menuService.TousBoissons().subscribe({
      next: (data) => {
        this.Boissons = data;
        console.log('Boissons reçues :', JSON.stringify(data, null, 2));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des boissons :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des boissons. Veuillez réessayer.'
        });
      }
    });

    this.menuService.TouspetitDej().subscribe({
      next: (data) => {
        this.Petitdejuner = data;
        console.log('Petits déjeuners reçus :', JSON.stringify(data, null, 2));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des petits déjeuners :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des petits déjeuners. Veuillez réessayer.'
        });
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.isChatOpen && this.chatMessages) {
      this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
    }
  }

  getImageUrl(image: string | undefined): string {
    return image ? `http://localhost:5000/uploads/${image}` : 'https://via.placeholder.com/150?text=Image+Indisponible';
  }

  handleImageError(event: Event, category: string, itemName: string): void {
    console.error(`Erreur de chargement de l'image pour ${category} dans ${itemName}:`, (event.target as HTMLImageElement).src);
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Indisponible';
    this.messageService.add({
      severity: 'warn',
      summary: 'Erreur d\'image',
      detail: `L'image pour ${category} dans ${itemName} n\'a pas pu être chargée.`
    });
  }

  navigateToMenu(): void {
    this.router.navigate(['/AccueilPersonnel/commandeMenu']);
  }

  commanderMenu(nom: string): void {
    const menu = this.menus.find(m => m.nom === nom);
    if (menu) {
      menu.favorited = !menu.favorited;
      this.messageService.add({
        severity: 'success',
        summary: 'Favori',
        detail: `${menu.nom} ${menu.favorited ? 'ajouté aux favoris' : 'retiré des favoris'}`
      });
      this.router.navigate(['/AccueilPersonnel/commandeMenu'], { queryParams: { Menu: nom } });
    }
  }

  SelectedMeal(p: Plat, typePlat: string): void {
    if (typePlat === 'Entrée') {
      this.EntreeSelectionne = this.EntreeSelectionne === p ? null : p;
    } else if (typePlat === 'Plat Principal') {
      this.PrincipauxSelectionne = this.PrincipauxSelectionne === p ? null : p;
    } else if (typePlat === 'Dessert') {
      this.DessertSelectionne = this.DessertSelectionne === p ? null : p;
    } else if (typePlat === 'Boisson') {
      this.BoissonsSelectionne = this.BoissonsSelectionne === p ? null : p;
    } else if (typePlat === 'Petit déjuner') {
      const index = this.DejunerSelectionne.findIndex(d => d._id === p._id);
      if (index > -1) {
        this.DejunerSelectionne.splice(index, 1);
      } else if (this.DejunerSelectionne.length < 3) {
        this.DejunerSelectionne.push(p);
      }
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Ajouté',
      detail: `${p.nom} ${this.isMealSelected(p, typePlat) ? 'ajouté au' : 'retiré du'} panier !`
    });
  }

  isMealSelected(p: Plat, typePlat: string): boolean {
    switch (typePlat) {
      case 'Entrée':
        return this.EntreeSelectionne === p;
      case 'Plat Principal':
        return this.PrincipauxSelectionne === p;
      case 'Dessert':
        return this.DessertSelectionne === p;
      case 'Boisson':
        return this.BoissonsSelectionne === p;
      case 'Petit déjuner':
        return this.DejunerSelectionne.includes(p);
      default:
        return false;
    }
  }

  afficherButtonPanier(): boolean {
    const selectionDej = this.DejunerSelectionne.length;
    if (selectionDej > 0 && selectionDej <= 3 && !this.EntreeSelectionne && !this.PrincipauxSelectionne && !this.DessertSelectionne) {
      return true;
    }
    if (this.EntreeSelectionne && this.PrincipauxSelectionne && this.DessertSelectionne) {
      return true;
    }
    const count =
      (this.EntreeSelectionne ? 1 : 0) +
      (this.PrincipauxSelectionne ? 1 : 0) +
      (this.DessertSelectionne ? 1 : 0) +
      (this.BoissonsSelectionne ? 1 : 0);
    return count === 4;
  }

  allerAuPanier(): void {
    const petitDejNoms = this.DejunerSelectionne.map(p => p.nom).join(',');
    this.router.navigate(['/AccueilPersonnel/PanierPlats'], {
      queryParams: {
        Entree: this.EntreeSelectionne?.nom || '',
        Principaux: this.PrincipauxSelectionne?.nom || '',
        Dessert: this.DessertSelectionne?.nom || '',
        Boissons: this.BoissonsSelectionne?.nom || '',
        PetitDej: petitDejNoms
      }
    });
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  send(): void {
    const input = this.userInput.trim();
    if (!input) return;
    this.messages.push({
      sender: 'Vous',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.userInput = '';
    this.isBotTyping = true;
    this.chatbotService.EnvoyerMessage(input).subscribe({
      next: (response) => {
        this.messages.push({
          sender: 'Bot',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.isBotTyping = false;
      },
      error: (err) => {
        console.error('Erreur du chatbot :', err);
        this.messages.push({
          sender: 'Bot',
          text: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.isBotTyping = false;
      }
    });
  }
  
}