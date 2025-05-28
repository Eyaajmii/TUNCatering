import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { Route, Router, RouterLink, RouterOutlet} from '@angular/router';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { ToastrService } from 'ngx-toastr';
import { ReclamationServiceService } from '../../../services/reclamation-service.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-acceuil-interface',
  imports: [RouterOutlet,CommonModule],
  templateUrl: './acceuil-interface.component.html',
  styleUrl: './acceuil-interface.component.css'
})
export class AcceuilInterfaceComponent implements OnInit{
  notifications: any[] = [];
  private subscriptions: Subscription = new Subscription();
  constructor(private authService: AuthService,private router:Router,private notifService:NotificationService){}
  ngOnInit(): void {
    this.subscriptions.add(
      this.notifService.onNewNotification().subscribe({
        next: (notif: any) => {
          this.notifications.push(notif);
        },
        error: (err) => {
          console.error('Erreur dans le flux des nouvelles commandes:', err);
        }
      })
    );
  }
  logout(): void {
    const token = this.authService.getToken();
    if (token) {
      this.authService.logout(token).subscribe({
        next: () => {
          localStorage.removeItem('token');
          this.router.navigate(['/login']); 
        },
        error: (err) => {
          console.error('Erreur lors de la déconnexion :', err);
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
