import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';  
import { Inject, Injectable, PLATFORM_ID  } from '@angular/core';  
import { catchError, Observable, of, Subject } from 'rxjs';  
import { ToastrService } from 'ngx-toastr';
import {io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';  
const FactureURL = "http://localhost:5000/api/facture"; 
const PrelevementURL = "http://localhost:5000/api/prelevement"; 
const SOCKET_URL = "http://localhost:5000"; 

export interface MontantParVol {
  vol: string;
  montant: number;
}

export interface MontantParPn {
  personnel: string;
  montant: number;
}
export interface Facture {
  _id: string; 
  numeroFacture: string;
  dateCreation?: Date; 
  DateFacture: Date;
  Statut: string;
  BonsLivraison: string[]; 
  montantTotal: number;
  montantParVol: MontantParVol[];
  montantParPn: MontantParPn[];
}
@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private socket!:Socket; 
  private newfacture = new Subject<Facture>();  
  private statusUpdates= new Subject<any>();  
  //private notificationSubject = new Subject<any>();
  private isBrowser: boolean;  
  constructor(private http: HttpClient,@Inject(PLATFORM_ID) private platformId: Object,private toastr:ToastrService) { 
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
          this.socket.emit('login', { userId, role,roleTunisair });
        }
      }
    });
    this.socket.on('newFacture', (data:any) =>{ this.newfacture.next(data);this.toastr.info(data.message);});
    this.socket.on('factureStatusUpdate', (data: any) => {this.statusUpdates.next(data);this.toastr.info(data.message);});
    //this.socket.on('newNotification', (data: any) => {this.notificationSubject.next(data);this.toastr.info(data.message);});
  }
  ajouterFacture(month: number, year: number = new Date().getFullYear()):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    return this.http.post<any>(`${FactureURL}/addFacture`,{},{headers,params});
  }
  AnnulerFacture(id:string):Observable<Facture>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.put<Facture>(`${FactureURL}/Annuler/${id}`,{},{headers});
  }
  //changer statut
  ModifierStatut(id:string,nouveauStatut:string):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${FactureURL}/updateStatusFacture/${id}`,{Statut:nouveauStatut},{headers})
  }
  getAllFactures(): Observable<any> {
    if (!this.isBrowser) {
      return of([]); 
    }
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get<any>(`${FactureURL}/tousfactures`,{headers});
  }
  DetailFacture(id:string):Observable<any>{
    return this.http.get<any>(`${FactureURL}/factureDetail/${id}`,)
  }
  /*Partie prelevement*/ 
ajouterPrelevement(dateDebut:string,dateFin:string):Observable<any>{
  return this.http.post<any>(`${PrelevementURL}/creer`, { dateDebut, dateFin });
}
lesPrelevement():Observable<any>{
  return this.http.get<any>(`${PrelevementURL}/tousPrelvement`);
}
annulerPrelevement(id:string):Observable<any>{
  return this.http.put<any>(`${PrelevementURL}/annule/${id}`,{});
}
MesPrelevelment():Observable<any>{
  const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get<any>(`${PrelevementURL}/MesPrelevement/`,{headers})
}
/**** Observables pour Socket.IO*** */
onNewFacture(): Observable<Facture> {
  return this.newfacture.asObservable();
}

onFactureStatusUpdate(): Observable<any> {
return this.statusUpdates.asObservable();
}
/*onNotification(): Observable<any> {
  return this.notificationSubject.asObservable();
}*/
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
