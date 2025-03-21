import { Routes } from '@angular/router';
import { AjoutPlatComponent } from './components/dashboardAdminTunCatering/ajout-plat/ajout-plat.component';
import { AjoutMenuComponent } from './components/dashboardAdminTunCatering/ajout-menu/ajout-menu.component';
import { AcceuilInterfaceComponent } from './components/dahsboardPn/acceuil-interface/acceuil-interface.component';
import { CommandeMenuComponent } from './components/dahsboardPn/commande-menu/commande-menu.component';
export const routes: Routes = [
    { path: 'ajoutplat', title:"Ajouter plat",component:AjoutPlatComponent },
    {path:'ajoutmenu',title:"Ajouter menu",component:AjoutMenuComponent},
    {path:'AcceuilPersonnel',title:'Acceuil',component:AcceuilInterfaceComponent},
    {path:'commandeMenu',title:'Commander',component:CommandeMenuComponent},
    {path:'',redirectTo:'ajoutplat',pathMatch:'full'}
];
