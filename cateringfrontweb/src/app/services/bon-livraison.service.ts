import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Inject, Injectable, PLATFORM_ID  } from '@angular/core';  
import { catchError, Observable, of, Subject } from 'rxjs';  
import { ToastrService } from 'ngx-toastr';
import {io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';  
const SOCKET_URL = "http://localhost:5000";
export interface BonLivraison {
  _id: string;
  numeroBon: string;
  dateCreation?: Date;
  Statut:string;
  vol: string;
  volInfo?:any; 
  commandes:any[]; 
  personnelLivraison?: any; 
  signatureResponsable?: string;
  dateLivraison?: Date;
  conformite:string;
  qrCodeImage?: string;
  updatedAt?: Date;
  Commantaire:string;
  Facturé:Boolean
}
@Injectable({
  providedIn: 'root'
})
export class BonLivraisonService {
  private apiUrl = 'http://localhost:5000/api/bonLivraison';
  private socket!:Socket;  
  private newBon= new Subject<BonLivraison>();  
  private statusUpdates= new Subject<any>();  
  private notificationSubject = new Subject<any>();
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
        const roleTunisair=localStorage.getItem('roleTunisair');
        const TypePersonnel=localStorage.getItem('TypePersonnel');
        if (userId && role&&roleTunisair &&TypePersonnel) {
          this.socket.emit('login', { userId, role,roleTunisair,TypePersonnel });
        }
      }
    });
    this.socket.on('NewBonLivraison', (data:BonLivraison) => this.newBon.next(data));
    this.socket.on('BonLivraisonStatusUpdate', (data: any) => this.statusUpdates.next(data));
    this.socket.on('newNotification', (data: any) => {this.notificationSubject.next(data);this.toastr.info(data.message);});
  }
  getBonByVolId(volId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vol/${volId}`);
  }
  getBnById(id:string):Observable<BonLivraison>{
    return this.http.get<BonLivraison>(`${this.apiUrl}/${id}`);
  }
  createBonLivraison(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, data);
  }
  getAllBonsLivraison(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`)
  }
  updateStatutBonLivraison(bonId: string, payload: any): Observable<any> {
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(`${this.apiUrl}/${bonId}/statut`,payload,{headers});
  }
  annulerBonLivraison(bonId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/annule/${bonId}`,{});
  }
  ModifierBonLivraison(id:string,bn:BonLivraison):Observable<BonLivraison>{
    return this.http.put<BonLivraison>(`${this.apiUrl}/modifier/${id}`, bn)
  }
  
  downloadPdf(numeroBon: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf/${numeroBon}`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
  }
  getNewBN():Observable<any>{
    return this.newBon.asObservable();
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