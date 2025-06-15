import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Inject, Injectable, PLATFORM_ID  } from '@angular/core';  
import { catchError, Observable, of, Subject } from 'rxjs';  
import { ToastrService } from 'ngx-toastr';
import {io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';  
const SOCKET_URL = "http://localhost:5000";
export interface Reclamation {
  _id: string;
  NumeroReclamation: string;
  dateSoumission?: Date;
  Objet: string;
  MessageEnvoye: string;
  MessageReponse: string;
  Statut:string;
  imageUrl?: string;
  MatriculePn?: string;
  MatriculeDirTunCater?: string;
  updatedAt?: Date;
  Commande:string
}
@Injectable({
  providedIn: 'root'
})
export class ReclamationServiceService {
  private reclamationURL = "http://localhost:5000/api/reclamation"; 
  private socket!:Socket;  
  private newReclamation= new Subject<Reclamation>();  
  private statusUpdates= new Subject<any>();  
  private notificationSubject = new Subject<any>();
  private isBrowser: boolean;  
  constructor(private http:HttpClient,@Inject(PLATFORM_ID) private platformId: Object,private toastr:ToastrService){ 
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
        const roleTunisair=localStorage.getItem('roleTunisair');
        //const TypePersonnel=localStorage.getItem('TypePersonnel');
        if (userId ) {
          this.socket.emit('login', { userId, role,roleTunisair });
        }
      }
    });
    this.socket.on('NewReclamation', (data:Reclamation) => this.newReclamation.next(data));
    this.socket.on('ReclamationStatusUpdate', (data: any) => this.statusUpdates.next(data));
    this.socket.on('newNotification', (data: any) => {this.notificationSubject.next(data);this.toastr.info(data.message);});
  }
  AjouterReclamation(data:FormData):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.post<any>(`${this.reclamationURL}/creerReclamation`,data,{headers});
  }
  ////
  getMesReclamations():Observable<any>{
    if (!this.isBrowser) {
      return of([]); 
    }
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.get<any>(`${this.reclamationURL}/reclamation`,{headers});
  }
  getDetailreclamation(id:string):Observable<any>{
    return this.http.get<any>(`${this.reclamationURL}/reclamation/detail/${id}`);
  }

  repondreReclamation(id:string,MessageReponse:string):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(`${this.reclamationURL}/repondre/${id}`,{MessageReponse},{headers})
  }
  getTousReclamations():Observable<any>{
    if (!this.isBrowser) {
      return of([]); 
    }
    return this.http.get<any>(`${this.reclamationURL}/reclamations`);
  }
  modifierReclamation(id:string,data:any):Observable<any>{
    return this.http.put<any>(`${this.reclamationURL}/modifier/${id}`,data);
  }
  annulerReclamation(id:string):Observable<any>{
    return this.http.put<any>(`${this.reclamationURL}/annuler/${id}`,{});
  }
  getNewReclamation():Observable<any>{
    return this.newReclamation.asObservable();
  }
  getStatusUpdate():Observable<any>{
    return this.statusUpdates.asObservable();
  }
  onNotification(): Observable<any> {
    return this.notificationSubject.asObservable();
  }
  // Pour rejoindre une room spécifique
  joinRoom(roomName: string): void {
    this.socket.emit('joinRoom', roomName);
  }
  leaveRoom(roomName: string): void {
    this.socket.emit('leaveRoom', roomName);
  }
  disconnect(): void {
    this.socket.disconnect();
  }
}
