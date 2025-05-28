import { Component } from '@angular/core';
import { NotificationService,Notification } from '../../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-envoie-notification',
  imports: [FormsModule,CommonModule],
  templateUrl: './envoie-notification.component.html',
  styleUrl: './envoie-notification.component.css'
})
export class EnvoieNotificationComponent {
  message:string="";
  success: boolean = false;
  error: string = "";
  constructor(private notificationService:NotificationService){}
  Ajouter(){
    this.notificationService.envoyerProbleme(this.message).subscribe({
      next:(notif:Notification)=>{
        this.success = true;
        this.error = "";
        this.message = notif.message ?? '';
      },
      error: (err) => {
        this.success = false;
        this.error = "Erreur lors de l'envoi de la notification.";
        console.error(err);
      }
    })
  }
}
