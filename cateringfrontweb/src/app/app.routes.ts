import { Routes } from '@angular/router';
import { AjoutPlatComponent } from './components/dashboardAdminTunCatering/ajout-plat/ajout-plat.component';
import { AjoutMenuComponent } from './components/dashboardAdminTunCatering/ajout-menu/ajout-menu.component';
export const routes: Routes = [
    { path: 'ajoutplat', title:"Ajouter plat",component:AjoutPlatComponent },
    {path:'ajoutmenu',title:"Ajouter menu",component:AjoutMenuComponent},
    {path:'',redirectTo:'ajoutplat',pathMatch:'full'}
];
