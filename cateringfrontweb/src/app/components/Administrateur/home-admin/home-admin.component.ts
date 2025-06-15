import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotificationService,Notification} from '../../../services/notification.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-home-admin',
  imports: [RouterOutlet, CommonModule, RouterLink,RouterLinkActive],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css'
})
export class HomeAdminComponent implements OnInit {
  notifications: Notification[] = [];
  isLoggingOut = false;
  showNotifications = false;
  unreadCount = 0;
  private subscriptions = new Subscription();
  NavOpen: boolean = true;
  selectedItem: string = '';
  email:string | null = null;
  username:string | null = null;
  role:string | null = null;
  constructor(private notificationService: NotificationService, private router: Router,private authService:AuthService) {}
  ngOnInit() {
    this.email=localStorage.getItem('email');
    this.username=localStorage.getItem('username');
    this.role=localStorage.getItem('role');

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
  gotoupdate(){
    this.router.navigate(['/Dashboard/ModifierProfil']);
  }
  logout(): void {
    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        this.isLoggingOut = false;
      },
      error: err => {
        console.error("Erreur de déconnexion", err);
        this.isLoggingOut = false;
      }
    });
  }
}
