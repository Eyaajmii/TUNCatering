import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dash-home',
  imports: [RouterOutlet,CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './dash-home.component.html',
  styleUrl: './dash-home.component.css'
})
export class DashHomeComponent implements OnInit {
  NavOpen: boolean = true;
  email:string | null = null;
  username:string | null = null;
  selectedItem: string = '';
  activeDropdown: string | null = null;
  dropdownRoutes = {
    Prelevement: ['/DashTunisairPersonnel/Prelevement/Ajoutprelevement', '/DashTunisairPersonnel/Prelevement/TousPrelevement'],
    
  };
  constructor(private router: Router) {}
  ngOnInit(): void {
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
