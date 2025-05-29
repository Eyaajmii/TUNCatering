import { Component, OnInit } from '@angular/core';
import { MenuServiceService, Plat } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './update-menu.component.html',
  styleUrl: './update-menu.component.css'
})
export class UpdateMenuComponent implements OnInit {
  menuForm!: FormGroup;
  menuId!: string;
  entrees: Plat[] = [];
  principaux: Plat[] = [];
  desserts: Plat[] = [];
  boissons: Plat[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private menuService: MenuServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.menuId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadPlats();
    this.loadMenu();
  }

  initForm() {
    this.menuForm = this.fb.group({
      nom: ['', Validators.required],
      prixtotal: [0, Validators.required],
      PlatsEntree: ['', Validators.required],
      PlatsPrincipaux: ['', Validators.required],
      PlatsDessert: ['', Validators.required],
      Boissons: ['', Validators.required],
      Disponible: [false],
    });
  }

  loadPlats() {
    this.menuService.TousEntree().subscribe(data => this.entrees = data);
    this.menuService.TousPrincipaux().subscribe(data => this.principaux = data);
    this.menuService.TousDessert().subscribe(data => this.desserts = data);
    this.menuService.TousBoissons().subscribe(data => this.boissons = data);
  }

  loadMenu() {
    this.menuService.getMenubyId(this.menuId).subscribe({
      next: (data) => {
        this.menuForm.patchValue({
          nom: data.nom,
          PlatsEntree: data.PlatsEntree[0]?._id,
          PlatsPrincipaux: data.PlatsPrincipaux[0]?._id,
          PlatsDessert: data.PlatsDessert[0]?._id,
          Boissons: data.Boissons[0]?._id,
          Disponible: data.Disponible,
        });
      },
      error: (err) => {
        alert("Erreur lors du chargement du menu.");
        console.error(err);
      }
    });
  }

  onSubmit() {
    if (this.menuForm.valid) {
      const menuPayload = {
        nom: this.menuForm.value.nom,
        prixtotal: this.menuForm.value.prixtotal,
        PlatsEntree: [this.menuForm.value.PlatsEntree],
        PlatsPrincipaux: [this.menuForm.value.PlatsPrincipaux],
        PlatsDessert: [this.menuForm.value.PlatsDessert],
        Boissons: [this.menuForm.value.Boissons],
        Disponible: this.menuForm.value.Disponible
      };
      this.menuService.modifierMenu(this.menuId, menuPayload).subscribe({
        next: () => {
          alert('Menu mis à jour avec succès.');
          this.router.navigate(['/DashAdmin/Menu/TousMenu']);
        },
        error: (err) => {
          alert('Erreur lors de la mise à jour.');
          console.error(err);
        }
      });
    }
  }
}
