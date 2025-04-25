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
import { ConsulteCommandesComponent } from './components/DashTunisairDirCatering/consulte-commandes/consulte-commandes.component';
import { HomeComponent } from './components/dahsboardPn/home/home.component';
import { AjoutFactureComponent } from './components/dashboardAdminTunCatering/ajout-facture/ajout-facture.component';
import { TousFacturesComponent } from './components/dashboardAdminTunCatering/tous-factures/tous-factures.component';
import { ControleFactureComponent } from './components/DashTunisairDirCatering/controle-facture/controle-facture.component';
import { ReclamationComponent } from './components/dahsboardPn/reclamation/reclamation.component';
import { TousreclamationComponent } from './components/DashTunisairDirCatering/tousreclamation/tousreclamation.component';
import { ConsulterReclamationComponent } from './components/dahsboardPn/consulter-reclamation/consulter-reclamation.component';
import { ReponsereclamationComponent } from './components/dahsboardPn/reponsereclamation/reponsereclamation.component';
import { LoginComponent } from './components/login/login.component';
import { DashHomeComponent } from './components/DashTunisairPersonnel/dash-home/dash-home.component';
import { AjoutCarnetComponent } from './components/dahsboardPn/ajout-carnet/ajout-carnet.component';
import { HomeAdminComponent } from './components/Administrateur/home-admin/home-admin.component';
import { RegisterComponent } from './components/Administrateur/register/register.component';
import { TousBonLivraisonComponent } from './components/dashboardAdminTunCatering/tous-bon-livraison/tous-bon-livraison.component';
import { DashChefComponent } from './components/dashboardChefCabine/dash-chef/dash-chef.component';
import { ListebonslivraisonsComponent } from './components/dashboardChefCabine/listebonslivraisons/listebonslivraisons.component';
import { AllbonslivraisonsComponent } from './components/DashTunisairDirCatering/allbonslivraisons/allbonslivraisons.component';
import { CreerPrelevemntComponent } from './components/DashTunisairPersonnel/creer-prelevemnt/creer-prelevemnt.component';
import { ConsultfactureComponent } from './components/DashTunisairPersonnel/consultfacture/consultfacture.component';
import { TousPrelevementsComponent } from './components/DashTunisairPersonnel/tous-prelevements/tous-prelevements.component';
import { ChatbotComponent } from './components/dahsboardPn/chatbot/chatbot.component';
export const routes: Routes = [
    {path:'login',title:'login',component:LoginComponent},
    //personnels navigant
    {path:'AccueilPersonnel',title:'Accueil',component:AcceuilInterfaceComponent,children:[
        {path:'',redirectTo:'Home',pathMatch:'full'},
        {path:'Home',title:'Home',component:HomeComponent},
        {path:'commandeMenu',title:'Commander',component:CommandeMenuComponent},
        {path:'PanierPlats',title:'Panier Plats',component:PanierPlatsComponent},
        {path:'MyOrders',title:'My Orders',component:EtatCommandeComponent},
        {path:'reclamation',title:'Reclamation',component:ReclamationComponent},
        {path:'MesReclamations',title:'Mes réclamations',component:ConsulterReclamationComponent},
        {path:'reponse/:id',title:'Reponse reclamation',component:ReponsereclamationComponent},
        {path:'CarnetSante',title:'Carnet de santé',component:AjoutCarnetComponent},
        {path:'chatbot',title:'ChatBot',component:ChatbotComponent},
    ]},
    //Dashboard admin tunisie catering
    {path:'DashAdmin',title:"Dashboard Admin",component:DashboardComponent,children:[
        //{path:'',redirectTo:'Dashboard Admin',pathMatch:'full'},
        { path: 'ajoutplat', title:"Ajouter plat",component:AjoutPlatComponent },
        {path:'ajoutmenu',title:"Ajouter menu",component:AjoutMenuComponent},
        {path:"TousCommandes",title:"Tous Commandes",component:AllOrdersComponent},
        {path:'TousPlats',title:'Tous Plats',component:AllMealsComponent},
        {path:'TousMenu',title:'Tous Menu',component:AllMenusComponent},
        {path:'CreateBonLivraison',title:'Ajouter bonLivraison',component:AjoutBonLivraisonComponent},
        { path: 'bonslivraison',title:'Tous les bons de livraisons', component:TousBonLivraisonComponent },
        {path:'createFacture',title:'Ajouter facture',component:AjoutFactureComponent},
        {path:'TousFactures',title:'Tous factures',component:TousFacturesComponent},
    ]},
    /*{path:"navbaritem",title:'navbaritem',component:NavbarItemsComponent},
    {path:"navbarAdmin",title:'navbaritemAdmin',component:NavbarComponent},*/
    //Dashboard admin direcetion catering
    {path:'TunisairCatering',title:'Tunisair Catering',component:DashboardDirectionComponent,children:[
        {path:'CommandeAffretes',title:'Commande Affretes',component:CommandeAffretteComponent},
        {path:'TousCommande',title:'Les commandes',component:ConsulteCommandesComponent},
        {path:'ControleFacture',title:'Controler facture',component:ControleFactureComponent},
        {path:'TousReclamations',title:'Tous Reclamations',component:TousreclamationComponent},
        {path:'TousBonsLivraion',title:'Les bons de livraison',component:AllbonslivraisonsComponent},
    ]},
    //Dashboard admin direcetion personnel
    {path:'DashTunisairPersonnel',title:'DashTunisairPersonnel',component:DashHomeComponent,children:[
        {path:'prelevement',title:'Création prélevement',component:CreerPrelevemntComponent},
        {path:'TousPrelevement',title:'Tous les prélevements',component:TousPrelevementsComponent},
        {path:'Lesfactures',title:'Les factures',component:ConsultfactureComponent}
    ]},
    //Dashboard adminstarteurr
    {path:'Dashboard',title:'Dashbord',component:HomeAdminComponent,children:[
        {path:'register',title:'Register',component:RegisterComponent},
    ]},
    //dashChef
    {path:'DashboardChefCabine',title:'Dashbord',component:DashChefComponent,children:[
        {path:'bonLivraison',title:'Bon livraison',component:ListebonslivraisonsComponent},
    ]},
    {path:'',redirectTo:'login',pathMatch:'full'}
];
