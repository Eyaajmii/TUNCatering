import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Inject, Injectable, PLATFORM_ID  } from '@angular/core';  
import { catchError, Observable, of, Subject } from 'rxjs';  
import { ToastrService } from 'ngx-toastr';
import {io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';  
export interface Vol {
  _id?: string; 
  numVol: string;
  volName: string;
  Depart: string;
  Destination: string;
  DureeVol: string;
  dateVolDep: Date;
  Escale: boolean;
  Commande: string[];
}
export interface Menu{
  _id?: string;
  nom:string;
  PlatsPrincipaux:Plat[];
  PlatsEntree:Plat[];
  PlatsDessert:Plat[];
  Boissons:Plat[];
  Disponible:boolean;
  prixtotal:number;
}
export interface Plat {
  _id: string;
  nom: string;
  typePlat: string;
  description?: string;
}

export interface Commande {
  _id: string;
  numeroCommande:string,
  Statut: string;
  plats: Plat[];
  dateCommnade: Date;
  NombreCommande: number;
  Matricule: any;
  menu?: Menu;
  vol: Vol;
  motifAnnulation:string
}
const commandeURL = "http://localhost:5000/api/commande"; 
const SOCKET_URL = "http://localhost:5000"; 

@Injectable({  
  providedIn: 'root'  
})  
export class CommandeServiceService {  
  private socket!:Socket;  
  private newOrders= new Subject<Commande>();  
  private statusUpdates= new Subject<any>();  
  private notificationSubject = new Subject<any>();
  private isBrowser: boolean;  
  private readonly apiUrl = 'http://localhost:5000/api/plat'; 
  private VolURL = "http://localhost:5000/api/vol"; 
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
        if (userId && role) {
          this.socket.emit('login', { userId, role });
        }
      }
    });
    this.socket.on('newOrder', (data:Commande) => this.newOrders.next(data));
    this.socket.on('orderStatusUpdate', (data: any) =>{ this.statusUpdates.next(data);this.toastr.info(data.message)});
    this.socket.on('newNotification', (data: any) => {this.notificationSubject.next(data);this.toastr.info(data.message);});
  }
  
  getVols():Observable<Vol[]>{
    return this.http.get<Vol[]>(`${this.VolURL}/`);
  }
  ModifierCommande(id:string,cmd:Commande):Observable<Commande>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.put<Commande>(`${commandeURL}/ModifierMaCommande/${id}`,cmd,{headers});
  }
  AnnulerCommande(id:string):Observable<Commande>{
    return this.http.put<Commande>(`${commandeURL}/${id}`,{});
  }
  commandeById(id:String):Observable<Commande>{
    return this.http.get<Commande>(`${commandeURL}/Commande/${id}`);
  }
  CommanderMenu(data:any):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.post<any>(`${commandeURL}/addCommandeMenu`,data,{headers});
  }
  CommanderPlats(data:any):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.post<any>(`${commandeURL}/addCommandePlat`,data,{headers});
  } 
  //commandebynumVol
  getCommandesByVol(id: string): Observable<any> {
    return this.http.get<any>(`${commandeURL}/vol/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching commandes by vol:', error);
        return of([]);
      })
    );
  }
  getInitialOrders(): Observable<any[]> { 
    if (!this.isBrowser) {
      return of([]); 
    }
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.get<any[]>(commandeURL,{headers})
  }
  getMyOrders(): Observable<any[]> {
    if (!this.isBrowser) {
      return of([]); 
    }
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get<any[]>(`${commandeURL}/Orders`,{headers})
  } 
  getPlatsDetails(platIds: string[]): Observable<Plat[]> {  
    return this.http.post<Plat[]>(`${this.apiUrl}/details`, { ids: platIds })  
    .pipe(  
      catchError(error => {  
        console.error('Error fetching meal details:', error);  
        return of([]);  
      })  
    );  
  } 
  updateOrderStatus(orderId: string, newStatus: string): Observable<any> {  
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.put<any>(`${commandeURL}/updateStatut/${orderId}`, { Statut: newStatus },{headers}).pipe(
      catchError(error => {
        console.error('Error updating order status:', error);
        this.toastr.error('Échec de la mise à jour du statut');
        throw error;
      })
    );  
  }
  AnnulationOrder(orderId: string): Observable<any> {  
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.put<any>(`${commandeURL}/annulationVol/${orderId}`, {  },{headers});
  }
/**** Observables pour Socket.IO*** */
  onNewOrder(): Observable<Commande> {
    return this.newOrders.asObservable();
  }

  onOrderStatusUpdate(): Observable<any> {
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