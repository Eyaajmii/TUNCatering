import { Routes } from '@angular/router';
import { AjoutPlatComponent } from './components/dashboardAdminTunCatering/ajout-plat/ajout-plat.component';
export const routes: Routes = [
    { path: 'ajoutplat', component:AjoutPlatComponent },
    {path:'',redirectTo:'ajoutplat',pathMatch:'full'}
];
