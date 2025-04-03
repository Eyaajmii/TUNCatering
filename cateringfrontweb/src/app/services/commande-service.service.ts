import { HttpClient } from '@angular/common/http';  
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';  
import { isPlatformBrowser } from '@angular/common';  
import { Observable, Subject, EMPTY, of } from 'rxjs';  
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';  
import { catchError, tap, retryWhen, delay, map, switchMap } from 'rxjs/operators';  
interface Plat {
  _id: string;
  nom: string;
  typePlat: string;
  prix: number;
  description?: string;
}
interface Commande {
  _id: string;
  Statut: string;
  plats: string[]; // Maintenant seulement des IDs
  dateCommnade: Date;
  // autres champs...
}
const commandeURL = "http://localhost:5000/api/commande"; // Update as needed  
const WS_URL = "ws://localhost:5000"; // WebSocket URL  

@Injectable({  
  providedIn: 'root'  
})  
export class CommandeServiceService {  
  private socket$: WebSocketSubject<any> | null = null;  
  private newOrders$ = new Subject<any>();  
  private statusUpdates$ = new Subject<any>();  
  private connectionStatus$ = new Subject<boolean>();  
  private isBrowser: boolean;  
  private readonly apiUrl = 'http://localhost:5000/api/meal'; // Remplacez par votre URL d'API

  constructor(  
    private http: HttpClient,  
    @Inject(PLATFORM_ID) private platformId: Object  
  ) {  
    this.isBrowser = isPlatformBrowser(this.platformId);  
    if (this.isBrowser) {  
      this.initializeWebSocket();  
    }  
  }  

  CommanderMenu(formData:FormData):Observable<any>{
    return this.http.post<any>(`${commandeURL}/addCommandeMenu`,formData);
  }
  CommanderPlats(formData:FormData):Observable<any>{
    return this.http.post<any>(`${commandeURL}/addCommandePlat`,formData);
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
    try {  
      if (msg.type === 'NEW_ORDER') {  
        this.newOrders$.next(msg.data);  
      } else if (msg.type === 'STATUS_UPDATE') {  
        this.statusUpdates$.next(msg.data);  
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

  getInitialOrders(): Observable<any[]> {  
    return this.http.get<any[]>(commandeURL).pipe(  
      switchMap(orders => {  
        const platIds = [...new Set(orders.flatMap(order => order.plats))];  
        
        if (platIds.length === 0) {  
          return of(orders);  
        }  
  
        return this.getPlatsDetails(platIds).pipe(  
          map((plats: Plat[]) => {  
            const platMap = new Map<string, Plat>(plats.map(plat => [plat._id, plat]));  
            
            return orders.map(order => ({  
              ...order,  
              plats: order.plats.map((platId: string) =>   
                platMap.get(platId) || this.createEmptyPlat(platId)  
              )  
            }));  
          }),  
          catchError(error => {  
            console.error('Error processing meal details:', error);  
            // Return the original orders without meal details  
            return of(orders);  
          })  
        );  
      }),  
      catchError(error => {  
        console.error('Error loading initial orders:', error);  
        // Optionally, return an empty array or handle the error as needed  
        return of([]);  
      })  
    );  
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
        throw error; // Rethrow the error to be handled by the caller  
      })  
    );  
  }  

  // WebSocket Observables  
  getNewOrders(): Observable<any> {  
    return this.newOrders$.asObservable();  
  }  
  getPlatsDetails(platIds: string[]): Observable<Plat[]> {  
    return this.http.post<Plat[]>(`${this.apiUrl}/details`, { ids: platIds })  
      .pipe(  
        catchError(error => {  
          console.error('Error fetching meal details:', error);  
          // Return an empty array as a fallback  
          return of([]);  
        })  
      );  
  }  
  getMouvements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/commandes/mouvements`);
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