import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io,Socket } from 'socket.io-client';
const socketUrl = "ws://localhost:5000"; 
@Injectable({
  providedIn: 'root'
})
export class TempsReelService {
  private socket:Socket;
  private notification$=new Subject<any>();
  private updateCommande$=new Subject<any>();
  constructor() {
    this.socket=io(socketUrl,{withCredentials:true,transports:['websocket']});
    this.setupSocketListeners();
  }
  private setupSocketListeners(): void {
    this.socket.on('newNotification', (notification: any) => {
      this.notification$.next(notification);
    });
    this.socket.on('connect', () => {
      console.log('Connecté au serveur WebSocket');
    });
    this.socket.on('disconnect', () => {
      console.log('Déconnecté du serveur WebSocket');
    });
  }
   // Enregistre user avec Socket.IO
   registerUser(matricule: string): void {
    this.socket.emit('registerUser', matricule);
  }
  subscribeToNotifications(matricule: string): void {
    this.socket.emit('subscribeNotifications', matricule);
  }
  // Rejoint une room de commande spécifique
  joinOrderRoom(orderId: string): void {
    this.socket.emit('joinOrderRoom', orderId);
  }
  leaveOrderRoom(orderId: string): void {
    this.socket.emit('leaveOrderRoom', orderId);
  }
  getNotifications(): Observable<any> {
    return this.notification$.asObservable();
  }
  getOrderUpdates(): Observable<any> {
    return this.updateCommande$.asObservable();
  }
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
