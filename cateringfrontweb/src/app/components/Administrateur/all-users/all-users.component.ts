import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-users',
  imports: [CommonModule],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css'
})
export class AllUsersComponent implements OnInit{
  users:any[]=[];
  error = '';
  loading=true;
  constructor(private authService:AuthService){}
  ngOnInit(): void {
    this.loadUser();
  }
  loadUser(){
    this.authService.TousUtilisateur().subscribe({
      next:(data)=>{
        this.users=data;
        this.loading = false;
      },
      error:(err)=>{
        this.error = "Erreur lors du chargement des utilisateurs.";
      }
    })
  }
  supprimer(id: string | undefined) {
    if (id) {
      const confirmation = confirm("Voulez-vous vraiment supprimer ce utilisateur ?");
      if (confirmation) {
        this.authService.SupprimerUtilisateur(id).subscribe({
          next: () => {
            alert('utilisateur supprimé avec succès.');
            this.loadUser();
          },
          error: (error) => {
            alert('Erreur lors de la suppression.');
            console.error(error);
          }
        });
      }
    }
  }
}
