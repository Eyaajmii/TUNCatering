import { Routes } from '@angular/router';
import { AjoutPlatComponent } from './components/dashboardAdminTunCatering/ajout-plat/ajout-plat.component';
import { AjoutMenuComponent } from './components/dashboardAdminTunCatering/ajout-menu/ajout-menu.component';
import { AcceuilInterfaceComponent } from './components/dahsboardPn/acceuil-interface/acceuil-interface.component';
import { CommandeMenuComponent } from './components/dahsboardPn/commande-menu/commande-menu.component';
import { PanierPlatsComponent } from './components/dahsboardPn/panier-plats/panier-plats.component';
import { DashboardComponent } from './components/dashboardAdminTunCatering/dashboard/dashboard.component';
import { NavbarItemsComponent } from './components/dashboardAdminTunCatering/navbar-items/navbar-items.component';
import { NavbarComponent } from './components/dashboardAdminTunCatering/navbar/navbar.component';
import { AllOrdersComponent } from './components/dashboardAdminTunCatering/all-orders/all-orders.component';
import { AllMealsComponent } from './components/dashboardAdminTunCatering/all-meals/all-meals.component';
import { AllMenusComponent } from './components/dashboardAdminTunCatering/all-menus/all-menus.component';
import { DashboardDirectionComponent } from './components/DashTunisairDirCatering/dashboard-direction/dashboard-direction.component';
import { EtatCommandeComponent } from './components/dahsboardPn/etat-commande/etat-commande.component';
import { CommandeAffretteComponent } from './components/DashTunisairDirCatering/commande-affrette/commande-affrette.component';
import { AjoutBonLivraisonComponent } from './components/dashboardAdminTunCatering/ajout-bon-livraison/ajout-bon-livraison.component';
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
    {path:"TousCommandes",title:"Tous Commandes",component:AllOrdersComponent},
    {path:'TousPlats',title:'Tous Plats',component:AllMealsComponent},
    {path:'TousMenu',title:'Tous Menu',component:AllMenusComponent},
    {path:'TunisairCatering',title:'Tunisair Catering',component:DashboardDirectionComponent},
    {path:'MyOrders',title:'My Orders',component:EtatCommandeComponent},
    {path:'CommandeAffretes',title:'Commande Affretes',component:CommandeAffretteComponent},
    {path:'CreateBonLivraison',title:'Ajouter bonLivraison',component:AjoutBonLivraisonComponent},
    {path:'',redirectTo:'DashAdmin',pathMatch:'full'}
];
