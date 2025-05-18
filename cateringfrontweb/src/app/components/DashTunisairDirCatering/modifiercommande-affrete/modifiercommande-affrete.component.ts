import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeServiceService, Vol } from '../../../services/commande-service.service';
import { MenuServiceService, Menu, Plat } from '../../../services/menu-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modifiercommande-affrete',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './modifiercommande-affrete.component.html',
  styleUrl: './modifiercommande-affrete.component.css'
})
export class ModifiercommandeAffreteComponent implements OnInit {
  commandeId: string = '';
  commande: any;
  menus: Menu[] = [];  
  vols:Vol[]=[];
  form!: FormGroup;

  constructor(private route: ActivatedRoute,private commandeService: CommandeServiceService,private menuService: MenuServiceService,private fb: FormBuilder,private router: Router,) {}

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.params['id'];
    this.form = this.fb.group({
      menuId: [''],
      volId:['']
    });
    this.loadCommande();
  }

  loadCommande() {
    this.menuService.TousMenu().subscribe(data => this.menus = data);
    this.commandeService.getVols().subscribe(d=>this.vols=d);
    this.commandeService.commandeById(this.commandeId).subscribe({
      next: (data) => {
        this.commande = data;
          this.form.patchValue({
            menuId: data.menu ?? '',
            volId:data.vol??''
        });
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la commande :', err);
      }
    });
  }
  updateCommande(): void {
    const updatedCommande: any = {};
    updatedCommande.menu = this.form.get('menuId')?.value;
    updatedCommande.vol = this.form.get('volId')?.value;
    this.commandeService.ModifierCommande(this.commandeId, updatedCommande).subscribe({
      next: () => {
        this.router.navigate(['/TunisairCatering/CommandeAffretes']);
      },
      error: () => alert('Erreur lors de la modification de la commande')
    });
  }
  retour(){
    this.router.navigate(['/TunisairCatering/CommandeAffretes'])
  }
}
