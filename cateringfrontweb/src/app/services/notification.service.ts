import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Inject, Injectable, PLATFORM_ID  } from '@angular/core';  
import { catchError, Observable, of, Subject } from 'rxjs';  
import { ToastrService } from 'ngx-toastr';
import {io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common'; 
const NotificationURL = "http://localhost:5000/api/notification"; 
const SOCKET_URL = "http://localhost:5000"; 
export interface Notification{
  _id: string;
  createdAt?: Date;
  emetteur: string;
  destinataire: string;
  isRead?: boolean;
  notificationType: string;
  message:string
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket!:Socket;  
  private newNotif= new Subject<any>(); 
  private isBrowser: boolean; 
  constructor(private http: HttpClient,private toastr:ToastrService,@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if(this.isBrowser){
    this.initializeSocket();
    }
  }
  private initializeSocket():void{
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      this.socket = io(SOCKET_URL, {
        auth: { token: localStorage.getItem('token') },
        transports: ['websocket']
      });
      this.setupSocketListeners();
    }
  }
  private setupSocketListeners():void{
    this.socket.on('connect', () => {
      console.log('Connecté à Socket.IO avec ID:', this.socket.id);
      if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('userId'); 
        const role = localStorage.getItem('role');
        const roleTunisair = localStorage.getItem('roleTunisair');
        if (userId && role) {
          this.socket.emit('login', { userId, role ,roleTunisair});
        }
      }
    });
    this.socket.on('NotificationProbeleme', (data: any) =>{ this.newNotif.next(data);this.toastr.info(data.message,'Nouvelle notification')});
  }
  envoyerProbleme(message: string): Observable<Notification> {
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
    });
    return this.http.post<Notification>(`${NotificationURL}/Probleme`,{ message },{headers});
  }
  ConsulterNotification():Observable<Notification[]>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
    });
    return this.http.get<Notification[]>(`${NotificationURL}/notifications`,{headers});
  }
  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${NotificationURL}/notifications/${notificationId}/read`, {});
  }
  onNewNotification(): Observable<Notification> {
    return this.newNotif.asObservable();
  }
}
