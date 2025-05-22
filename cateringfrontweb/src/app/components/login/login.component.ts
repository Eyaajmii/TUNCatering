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
  error='';
  constructor(private router: Router,private authService:AuthService) { }
  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        const decoded = this.authService.decodeToken(res.token);
        const role = decoded.role;
        const typePersonnel = decoded.TypePersonnel;
        if (role === "Personnel Tunisair") {
          this.authService.getPersonnelTunisairByUsername(decoded.username).subscribe({
            next: (data) => {
              const roleTunisair = data.roleTunisair;  
              switch (roleTunisair) {
                case "Personnel navigant":
                  if (typePersonnel === "Chef de cabine") {
                    this.router.navigate(['/DashboardChefCabine']);
                  } else {
                    this.router.navigate(['/AccueilPersonnel']);
                  }
                  break;
                case "Personnel de Direction du Catering Tunisiar":
                  this.router.navigate(['/TunisairCatering']);
                  break;
                case "Personnel de Direction du Personnel Tunisiar":
                  this.router.navigate(['/DashTunisairPersonnel']);
                  break;
                default:
                  this.router.navigate(['/']);
                  break;
              }
            },
            error: (err) => {
              console.error("Erreur récupération roleTunisair", err);
              this.router.navigate(['/']);
            }
          });
        } else if (role == "Personnel Tunisie Catering") {
          this.router.navigate(['/DashAdmin']);
        } else if (role == "Administrateur") {
          this.router.navigate(['/Dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur de connexion';
      }
    });
  }  
}