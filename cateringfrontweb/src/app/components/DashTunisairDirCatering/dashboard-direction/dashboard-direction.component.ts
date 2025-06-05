import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotificationService,Notification} from '../../../services/notification.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';



@Component({
  selector: 'app-dashboard-direction',
  imports: [RouterOutlet,CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './dashboard-direction.component.html',
  styleUrl: './dashboard-direction.component.css'
})
export class DashboardDirectionComponent implements OnInit {
  notifications: Notification[] = [];
  isLoggingOut = false;
  showNotifications = false;
  unreadCount = 0;
  private subscriptions = new Subscription();
  NavOpen: boolean = true;
  selectedItem: string = '';
  activeDropdown: string | null = null;
  dropdownRoutes = {
    Options: ['/TunisairCatering/ControleFacture', '/TunisairCatering/ControleFacture',"/TunisairCatering/TousReclamations","/TunisairCatering/TousBonsLivraion","/TunisairCatering/Notification"],
  };
  email:string | null = null;
  username:string | null = null;
  role:string | null = null;
  constructor(private router: Router,private notificationService: NotificationService,private authService:AuthService){}

  ngOnInit(): void {
    this.loadNotifications();
   this.checkActiveRoute();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveRoute();
    });
    this.email=localStorage.getItem('email');
    this.username=localStorage.getItem('username');
    this.role=localStorage.getItem('role');
 }
 checkActiveRoute() {
  const currentRoute = this.router.url;
  this.activeDropdown = null;

  for (const [key, routes] of Object.entries(this.dropdownRoutes)) {
    if (routes.some(route => currentRoute.includes(route))) {
      this.activeDropdown = key;
      break;
    }
  }
}

toggleDropdown(dropdownId: string, event: Event) {
  event.stopPropagation();
  this.activeDropdown = this.activeDropdown === dropdownId ? null : dropdownId;
}

selectItem(item: string) {
  this.selectedItem = item;
}
toggleNotifications(): void {
  this.showNotifications = !this.showNotifications;
}
loadNotifications(): void {
  this.subscriptions.add(
    this.notificationService.ConsulterNotification().subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications;
        this.updateUnreadCount();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notifications', err);
      }
    })
  );
}

trackByNotificationId(index: number, notification: Notification): string {
  return notification._id;
}

markAsRead(notificationId: string): void {
  const notif = this.notifications.find(n => n._id === notificationId);
  if (notif && !notif.isRead) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        notif.isRead = true;
        this.updateUnreadCount();
      },
      error: (err) => {
        console.error('Failed to mark notification as read', err);
      }
    });
  }
}
private updateUnreadCount(): void {
  this.unreadCount = this.notifications.filter(n => !n.isRead).length;
}
async logout(){
   this.authService.logout(); 
}
}
