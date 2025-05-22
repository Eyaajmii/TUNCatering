import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';  
import { isPlatformBrowser } from '@angular/common';  
import { Observable, Subject, EMPTY, of } from 'rxjs';  
import { catchError, tap } from 'rxjs/operators';  
import { ToastrService } from 'ngx-toastr';
import { io, Socket } from 'socket.io-client'; 
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

interface Plat {
  _id: string;
  nom: string;
  typePlat: string;
  prix: number;
  description?: string;
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
interface Commande {
  _id: string;
  Statut: string;
  plats: string[]; 
  dateCommnade: Date;
  NombreCommande:number;
  menu:Menu|string;
  vol:Vol|string;
}
const commandeURL = "http://localhost:5000/api/commande"; 
const SOCKET_URL = "http://localhost:5000"; 

@Injectable({  
  providedIn: 'root'  
})  
export class CommandeServiceService {  
  private socket:Socket| null = null;  
  private newOrders$ = new Subject<any>();  
  private statusUpdates$ = new Subject<any>();  
  private connectionStatus$ = new Subject<boolean>();  
  private isBrowser: boolean;  
  private readonly apiUrl = 'http://localhost:5000/api/plat'; 
  private VolURL = "http://localhost:5000/api/vol"; 
  constructor(  
    private http: HttpClient,  
    @Inject(PLATFORM_ID) private platformId: Object  ,
    private toastr: ToastrService
  ) {  
    this.isBrowser = isPlatformBrowser(this.platformId);  
    if (this.isBrowser) {  
      this.initializeSocketIO();  
    }  
  }
  private initializeSocketIO(): void {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
      this.connectionStatus$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.warn('Socket.IO disconnected');
      this.connectionStatus$.next(false);
    });
    this.socket.on('newOrder', (data: any) => {
      this.newOrders$.next(data);
      this.toastr.info('Nouvelle commande reçue!', 'Mise à jour en temps réel');
    });
    this.socket.on('orderStatusUpdate', (data: any) => {
      this.statusUpdates$.next(data);
      this.toastr.info('Statut de commande mis à jour', 'Mise à jour en temps réel');
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
      this.connectionStatus$.next(false);
    });
  }
  updateOrderStatus(orderId: string, newStatus: string): Observable<any> {  
    return this.http.put<any>(
      `${commandeURL}/updateStatut/${orderId}`, 
      { Statut: newStatus }
    ).pipe(
      catchError(error => {
        console.error('Error updating order status:', error);
        this.toastr.error('Échec de la mise à jour du statut');
        throw error;
      })
    );  
  }
  closeConnection(): void {  
    if (this.socket) {  
      this.socket.disconnect();
      this.socket = null;  
    }  
  }  
  getVols():Observable<Vol[]>{
    return this.http.get<Vol[]>(`${this.VolURL}/`);
  }
  ModifierCommande(id:string,cmd:Commande):Observable<Commande>{
    return this.http.put<Commande>(`${commandeURL}/ModifierMaCommande/${id}`,cmd);
  }
  AnnulerCommande(id:string):Observable<Commande>{
    return this.http.put<Commande>(`${commandeURL}/${id}`,{});
  }
  commandeById(id:String):Observable<Commande>{
    return this.http.get<Commande>(`${commandeURL}/Commande/${id}`);
  }
  //pour personnel navigant
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
  //pour direction tunisair du catering
  CommanderAffretes(data:any):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.post<any>(`${commandeURL}/addCommandeAffrete`,data,{headers});
  }
  //commandebynumVol
  getCommandesByVol(numVol: string): Observable<any> {
    return this.http.get<any>(`${commandeURL}/vol/${numVol}`).pipe(
      catchError(error => {
        console.error('Error fetching commandes by vol:', error);
        return of([]);
      })
    );
  }
  sendStatusUpdate(orderId: string, newStatus: string): void {
    if (this.socket) {
      this.socket.emit('statusUpdate', {
        orderId,
        newStatus
      });
    }
  }
  //AllOrders
    getInitialOrders(): Observable<any[]> {  
      return this.http.get<any[]>(commandeURL)
    }
getMyOrders(): Observable<any[]> {
      const token = localStorage.getItem('token'); 
      const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${commandeURL}/Orders`,{headers})

} 

  getNewOrders(): Observable<any> {  
    return this.newOrders$.asObservable();  
  }  
  //plat detail
  getPlatsDetails(platIds: string[]): Observable<Plat[]> {  
    return this.http.post<Plat[]>(`${this.apiUrl}/details`, { ids: platIds })  
      .pipe(  
        catchError(error => {  
          console.error('Error fetching meal details:', error);  
          return of([]);  
        })  
      );  
  }  
  getStatusUpdates(): Observable<any> {  
    return this.statusUpdates$.asObservable();  
  }  

  getConnectionStatus(): Observable<boolean> {  
    return this.connectionStatus$.asObservable();  
  }  
  connectUser(userId: string): void {
    if (this.socket && userId) {
      this.socket.emit('login', userId);
    }
  }
} 