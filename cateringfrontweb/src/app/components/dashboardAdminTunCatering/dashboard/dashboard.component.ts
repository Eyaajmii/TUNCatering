import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink,RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  NavOpen: boolean = true;
  selectedItem: string = '';
  activeDropdown: string | null = null;
  dropdownRoutes = {
    Plat: ['/DashAdmin/Plat/TousPlats', '/DashAdmin/Plat/ajoutplat'],
    Menu: ['/DashAdmin/Menu/TousMenu', '/DashAdmin/Menu/ajoutmenu'],
    Livraison: ['/DashAdmin/Livraison/bonslivraison', '/DashAdmin/Livraison/CreateBonLivraison'],
    Facture: ['/DashAdmin/Facture/TousFactures', '/DashAdmin/Facture/createFacture']
  };
  email:string | null = null;
  username:string | null = null;
  constructor(private router: Router) {}

  ngOnInit() {
    this.checkActiveRoute();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveRoute();
    });
    this.email=localStorage.getItem('email');
    this.username=localStorage.getItem('username');
  }

  checkActiveRoute() {
    const currentRoute = this.router.url;
    this.activeDropdown = null;

    for (const [key, routes] of Object.entries(this.dropdownRoutes)) {
      if (routes.some(route => currentRoute.includes(route))) {
        this.activeDropdown = key;
        break;
      }
    }
  }

  toggleDropdown(dropdownId: string, event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === dropdownId ? null : dropdownId;
  }

  selectItem(item: string) {
    this.selectedItem = item;
  }
  
}