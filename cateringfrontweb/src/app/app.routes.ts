import { Routes } from '@angular/router';
import { AjoutPlatComponent } from './components/dashboardAdminTunCatering/ajout-plat/ajout-plat.component';
export const routes: Routes = [
    { path: 'ajout-plat', component:AjoutPlatComponent },
    {path:'',redirectTo:'ajout-plat',pathMatch:'full'}
];
