import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username='';
  password='';
  Matricule='';
  showMatricule = false;
  error='';
  constructor(private router: Router,private authService:AuthService) { }
  onSubmit(){
    this.authService.login(this.username,this.Matricule,this.password).subscribe({
      next:(res)=>{
        this.authService.saveToken(res.token);
        const decoded = this.authService.decodeToken(res.token);
        if(decoded && decoded.role){
        const role = decoded.role;
        const typePersonnel = decoded.TypePersonnel;
        if(role=="Personnel navigant"){
          if (typePersonnel === "Chef de cabine") {
            this.router.navigate(['/DashboardChefCabine']);
          } else {
            this.router.navigate(['/AccueilPersonnel']);
          }
        }else if(role=="Personnel Tunisie Catering"){
          this.router.navigate(['/DashAdmin']);
        }else if(role=="Personnel de Direction du Catering Tunisiar"){
          this.router.navigate(['/TunisairCatering']);
        }else if(role=="Personnel de Direction du Personnel Tunisiar"){
          this.router.navigate(['/DashTunisairPersonnel']);
        }else if(role=="Administrateur"){
          this.router.navigate(['/Dashboard']);
        }else{
          this.router.navigate(['/']);
        }
      }
    },
      error:(err)=>{
        this.error = err.error?.message || 'Erreur de connexion';

      }
    })
  }
}
