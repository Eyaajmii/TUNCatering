import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';  
import { isPlatformBrowser } from '@angular/common';  
import { Observable, Subject, EMPTY, of } from 'rxjs';  
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';  
import { catchError, tap, retryWhen, delay, map, switchMap } from 'rxjs/operators';  
import { ToastrService } from 'ngx-toastr';
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
const VolURL = "http://localhost:5000/api/vol"; 
const WS_URL = "ws://localhost:5000"; 

@Injectable({  
  providedIn: 'root'  
})  
export class CommandeServiceService {  
  private socket$: WebSocketSubject<any> | null = null;  
  private newOrders$ = new Subject<any>();  
  private statusUpdates$ = new Subject<any>();  
  private connectionStatus$ = new Subject<boolean>();  
  private isBrowser: boolean;  
  private readonly apiUrl = 'http://localhost:5000/api/meal'; 
  private VolURL = "http://localhost:5000/api/vol"; 
  constructor(  
    private http: HttpClient,  
    @Inject(PLATFORM_ID) private platformId: Object  ,
    private toastr: ToastrService
  ) {  
    this.isBrowser = isPlatformBrowser(this.platformId);  
    if (this.isBrowser) {  
      this.initializeWebSocket();  
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
  private initializeWebSocket(): void {  
    try {  
      if (typeof WebSocket !== 'undefined') {  
        this.connect();  
      } else {  
        console.warn('WebSocket not available in this environment');  
      }  
    } catch (e) {  
      console.error('WebSocket initialization failed:', e);  
    }  
  }  

  private connect(): void {  
    if (this.socket$ && !this.socket$.closed) {  
      return;  
    }  

    this.socket$ = webSocket({  
      url: WS_URL,  
      openObserver: {  
        next: () => {  
          console.log('WebSocket connection established');  
          this.connectionStatus$.next(true);  
        }  
      },  
      closeObserver: {  
        next: () => {  
          console.log('WebSocket connection closed');  
          this.connectionStatus$.next(false);  
          this.reconnect();  
        }  
      },  
      serializer: msg => JSON.stringify(msg),  
      deserializer: msg => JSON.parse(msg.data)  
    });  

    this.socket$.pipe(  
      catchError((error: any) => {  
        console.error('WebSocket error:', error);  
        this.connectionStatus$.next(false);  
        return EMPTY;  
      }),  
      retryWhen((errors: any) =>  
        errors.pipe(  
          delay(5000),  
          tap(() => console.log('Retrying WebSocket connection...'))  
        )  
      )  
    ).subscribe({  
      next: (msg: any) => this.handleMessage(msg),  
      error: (err: any) => console.error('WebSocket subscription error:', err),  
      complete: () => console.log('WebSocket subscription completed')  
    });  
  }  

  private handleMessage(msg: any): void {
    console.log("Message reçu :", msg);  
    try {  
      if (msg.type === 'NEW_ORDER') {  
        this.newOrders$.next(msg.data);
       // this.toastr.success('Nouvelle commande recue','Notification');  
      } else if (msg.type === 'STATUS_UPDATE' ) {  
        this.statusUpdates$.next(msg.data);  
        //this.toastr.info('Statut de la commande mis à jour', 'Mise à jour');
      }  
    } catch (e) {  
      console.error('Error processing WebSocket message:', e);  
    }  
  }  

  private reconnect(): void {  
    if (this.isBrowser) {  
      setTimeout(() => this.connect(), 5000);  
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
private createEmptyPlat(platId: string): Plat {
  return {
    _id: platId,
    nom: 'Plat non disponible',
    typePlat: 'Inconnu',
    prix: 0,
    description: ''
  };
}
  updateOrderStatus(orderId: string, newStatus: string): Observable<any> {  
    return this.http.put<any>(`${commandeURL}/updateStatut/${orderId}`, { Statut: newStatus }).pipe(  
      tap(updatedOrder => {  
        if (this.socket$ && !this.socket$.closed) {  
          this.socket$.next({  
            type: 'STATUS_UPDATE_REQUEST',  
            data: { _id: orderId, Statut: newStatus }  
          });  
        }  
      }),  
      catchError(error => {  
        console.error('Error updating order status:', error);  
        throw error;
      })  
    );  
  }  

  // WebSocket Observables  
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

  closeConnection(): void {  
    if (this.socket$) {  
      this.socket$.complete();  
      this.socket$ = null;  
    }  
  }  

  get isWebSocketAvailable(): boolean {  
    return this.isBrowser && typeof WebSocket !== 'undefined';  
  }  
  
} 