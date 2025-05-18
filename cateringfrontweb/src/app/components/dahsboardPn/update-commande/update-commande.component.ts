import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { MenuServiceService, Menu, Plat } from '../../../services/menu-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-commande',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './update-commande.component.html',
  styleUrls: ['./update-commande.component.css']
})
export class UpdateCommandeComponent implements OnInit {
  commandeId: string = '';
  commande: any;
  menus: Menu[] = [];
  platsEntree: Plat[] = [];
  platsPrincipal: Plat[] = [];
  platsDessert: Plat[] = [];
  boissons: Plat[] = [];
  form!: FormGroup;
  isMenu: boolean = false;

  constructor(private route: ActivatedRoute,private commandeService: CommandeServiceService,private menuService: MenuServiceService,private fb: FormBuilder,private router: Router,) {}

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.params['id'];
    this.form = this.fb.group({
      menuId: [''],
      entreeId: [''],
      principalId: [''],
      dessertId: [''],
      boissonId: ['']
    });
    this.loadCommande();
  }

  loadCommande() {
    this.menuService.TousMenu().subscribe(data => this.menus = data);
    this.menuService.TousEntree().subscribe(data => this.platsEntree = data);
    this.menuService.TousPrincipaux().subscribe(data => this.platsPrincipal = data);
    this.menuService.TousDessert().subscribe(data => this.platsDessert = data);
    this.menuService.TousBoissons().subscribe(data => this.boissons = data);

    this.commandeService.commandeById(this.commandeId).subscribe({
      next: (data) => {
        this.commande = data;
        if (data.menu) {
          this.isMenu = true;
          this.form.patchValue({
            menuId: data.menu ?? ''
          });
        } else {
          this.isMenu = false;
          this.form.patchValue({
            entreeId: data.plats[0] ?? '',
            principalId: data.plats[1] ?? '',
            dessertId: data.plats[2] ?? '',
            boissonId: data.plats[3] ?? ''
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la commande :', err);
      }
    });
  }

  updateCommande(): void {
    const updatedCommande: any = {};
    if (this.isMenu) {
      updatedCommande.menu = this.form.get('menuId')?.value;
    } else {
      updatedCommande.menu = null;
      updatedCommande.plats = [
        this.form.get('entreeId')?.value,
        this.form.get('principalId')?.value,
        this.form.get('dessertId')?.value,
        this.form.get('boissonId')?.value
      ].filter(Boolean); 
    }

    this.commandeService.ModifierCommande(this.commandeId, updatedCommande).subscribe({
      next: () => {
        this.router.navigate(['/AccueilPersonnel/MyOrders']);
      },
      error: () => alert('Erreur lors de la modification de la commande')
    });
  }
  retour(){
    this.router.navigate(['/AccueilPersonnel/MyOrders'])
  }
}
