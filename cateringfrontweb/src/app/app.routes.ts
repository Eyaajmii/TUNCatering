import { Routes } from '@angular/router';
import { AjoutPlatComponent } from './components/dashboardAdminTunCatering/ajout-plat/ajout-plat.component';
import { AjoutMenuComponent } from './components/dashboardAdminTunCatering/ajout-menu/ajout-menu.component';
import { AcceuilInterfaceComponent } from './components/dahsboardPn/acceuil-interface/acceuil-interface.component';
import { CommandeMenuComponent } from './components/dahsboardPn/commande-menu/commande-menu.component';
import { PanierPlatsComponent } from './components/dahsboardPn/panier-plats/panier-plats.component';
import { DashboardComponent } from './components/dashboardAdminTunCatering/dashboard/dashboard.component';
import { NavbarItemsComponent } from './components/dashboardAdminTunCatering/navbar-items/navbar-items.component';
import { NavbarComponent } from './components/dashboardAdminTunCatering/navbar/navbar.component';
import { CommandesTempsReelComponent } from './components/dashboardAdminTunCatering/commandes-temps-reel/commandes-temps-reel.component';
import { CommandesComponent } from './components/dashboardAdminTunCatering/commande-mouvements/commande-mouvements.component';
import { BonLivraisonComponent } from './components/dashboardAdminTunCatering/bon-livraison/bon-livraison.component';
export const routes: Routes = [
    { path: 'ajoutplat', title:"Ajouter plat",component:AjoutPlatComponent },
    {path:'ajoutmenu',title:"Ajouter menu",component:AjoutMenuComponent},
    {path:'AcceuilPersonnel',title:'Acceuil',component:AcceuilInterfaceComponent},
    {path:'commandeMenu',title:'Commander',component:CommandeMenuComponent},
    {path:'PanierPlats',title:'Panier Plats',component:PanierPlatsComponent},
    {path:'DashAdmin',title:"Dashboard Admin",component:DashboardComponent},
    {path:"navbaritem",title:'navbaritem',component:NavbarItemsComponent},
    {path:"navbarAdmin",title:'navbaritemAdmin',component:NavbarComponent},
    {path:"navbarAdmin",title:'navbaritemAdmin',component:NavbarComponent},
    {path:"AdminCatering",title:'consulter commande',component:CommandesTempsReelComponent},
    {path:"Direction du catering tunisair",title:'consulter commande',component:CommandesComponent},
    {path:"Bon-Livraison",title:'crer bon livraison',component:BonLivraisonComponent},
    {path:'',redirectTo:'DashAdmin',pathMatch:'full'}
];
