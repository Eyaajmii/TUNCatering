import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-menus',
  imports: [CommonModule],
  templateUrl: './all-menus.component.html',
  styleUrl: './all-menus.component.css'
})
export class AllMenusComponent implements OnInit {
  menus:Menu[]=[];
  constructor(private MenuService:MenuServiceService,private router: Router){}
  ngOnInit(): void {
    this.loadMenu();
  }
  loadMenu(){
    this.MenuService.TousMenu().subscribe(d=>{
      console.log(d);
      this.menus=d;
    })
  }
  modifier(id: string | undefined) {
    if (id) {
      this.router.navigate(['/DashAdmin/ModifierMenu', id]);
    }
  }
  supprimer(id: string | undefined) {
    if (id) {
      const confirmation = confirm("Voulez-vous vraiment supprimer ce menu ?");
      if (confirmation) {
        this.MenuService.supprimerMenu(id).subscribe({
          next: () => {
            alert('Menu supprimé avec succès.');
            this.loadMenu();
          },
          error: (error) => {
            alert('Erreur lors de la suppression.');
            console.error(error);
          }
        });
      }
    }
  }
  voir(id:string |undefined){
    if(id){
      this.router.navigate(['/DashAdmin/TousPlats'],{queryParams:{platId:id}})
    }
  }
}
