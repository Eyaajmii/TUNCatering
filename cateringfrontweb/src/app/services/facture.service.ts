import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, Subject, EMPTY, of } from 'rxjs';  
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';  
import { catchError, tap, retryWhen, delay, map, switchMap } from 'rxjs/operators';  
import { isPlatformBrowser } from '@angular/common';  
const FactureURL = "http://localhost:5000/api/facture"; 
const PrelevementURL = "http://localhost:5000/api/prelevement"; 
const WS_URL = "ws://localhost:5000"; 
@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private socket$: WebSocketSubject<any> | null = null;  
  private newfacture$ = new Subject<any>();  
  private statusUpdates$ = new Subject<any>();  
  private connectionStatus$ = new Subject<boolean>();  
  private isBrowser: boolean;  
  constructor(private http: HttpClient,@Inject(PLATFORM_ID) private platformId: Object) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
    if(this.isBrowser){
      this.initializeWebSocket(); 
    }
  }
  ajouterFacture(date:string):Observable<any>{
    return this.http.post<any>(`${FactureURL}/addFacture`,{date});
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
      if (msg.type === 'NEW_Facture') {  
        this.newfacture$.next(msg.data);  
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
getNewFactures(): Observable<any> {
  return this.newfacture$.asObservable();
}
getStatusUpdate():Observable<any>{
  return this.statusUpdates$.asObservable();
}
getConnectionStatus(): Observable<boolean> {
  return this.connectionStatus$.asObservable();
}
//changer statut
ModifierStatut(id:string,nouveauStatut:string):Observable<any>{
  return this.http.put(`${FactureURL}/updateStatusFacture/${id}`,{Statut:nouveauStatut}).pipe(
    tap(updatedfacture=>{
      if (this.socket$ && !this.socket$.closed) {  
        this.socket$.next({  
          type: 'STATUS_UPDATE_REQUEST',  
          data: { _id: id, Statut: nouveauStatut }  
        });  
      }  
    }),
    catchError(error => {  
      console.error('Error updating bill status:', error);  
      throw error;
    })  
  );
}
getAllFactures(): Observable<any> {
  return this.http.get<any>(`${FactureURL}/tousfactures`);
}
loseConnection(): void {  
  if (this.socket$) {  
    this.socket$.complete();  
    this.socket$ = null;  
  }  
}  

get isWebSocketAvailable(): boolean {  
  return this.isBrowser && typeof WebSocket !== 'undefined';  
}  

/*Partie prelevement*/ 
ajouterPrelevement(dateDebut:string,dateFin:string):Observable<any>{
  return this.http.post<any>(`${PrelevementURL}/creer`, { dateDebut, dateFin });
}
lesPrelevement():Observable<any>{
  return this.http.get<any>((`${PrelevementURL}/tousPrelvement`));
}
}
