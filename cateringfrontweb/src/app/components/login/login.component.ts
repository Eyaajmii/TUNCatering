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
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.user._id); 
        localStorage.setItem("role", res.user.role);
        localStorage.setItem("Matricule", res.user.Matricule);
        localStorage.setItem("RoleTunisair", res.user.roleTunisair);
        localStorage.setItem("TypePersonnel", res.user.TypePersonnel);
        localStorage.setItem("email", res.user.email);
        localStorage.setItem("username", res.user.username);
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
                    this.router.navigate(['/AccueilPersonnel']);
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
      error: (error) => {
        const message = error?.error?.message;
      if (message) {
        alert(message); 
      } else {
        alert("Probleme de connextion");
      }
    },
    });
  }  
}