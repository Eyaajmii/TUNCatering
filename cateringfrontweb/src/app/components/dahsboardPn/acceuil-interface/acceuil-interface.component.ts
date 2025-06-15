import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-acceuil-interface',
  imports: [RouterOutlet, CommonModule,RouterModule],
  templateUrl: './acceuil-interface.component.html',
  styleUrls: ['./acceuil-interface.component.css']
})
export class AcceuilInterfaceComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  isLoggingOut = false;
  showNotifications = false;
  unreadCount = 0;

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.initializeNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeNotifications(): void {
    this.subscriptions.add(
      this.notificationService.onNewNotification().subscribe({
        next: (notification: any) => {
          const formattedNotification: Notification = {
            _id: this.generateId(),
            message: notification.message,
            notificationType: notification.notificationType || 'info',
            createdAt: new Date(),
            isRead: false,
            emetteur: '',
            destinataire: ''
          };

          this.notifications.unshift(formattedNotification);
          this.updateUnreadCount();

          this.showToastNotification(formattedNotification);
        },
        error: (error) => {
          console.error('Error receiving notifications:', error);
          this.toastr.error('Failed to receive notifications');
        }
      })
    );
  }

  private showToastNotification(notification: Notification): void {
    switch (notification.notificationType) {
      case 'success':
        this.toastr.success(notification.message);
        break;
      case 'warning':
        this.toastr.warning(notification.message);
        break;
      case 'error':
        this.toastr.error(notification.message);
        break;
      default:
        this.toastr.info(notification.message);
    }
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

  private generateId(): string {
    return Math.random().toString(36).slice(2, 11);
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
