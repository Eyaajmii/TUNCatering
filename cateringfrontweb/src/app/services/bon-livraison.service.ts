import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
export interface BonLivraison {
  _id?: string;
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
}
@Injectable({
  providedIn: 'root'
})
export class BonLivraisonService {
  private apiUrl = 'http://localhost:5000/api/bonLivraison';
  constructor(private http: HttpClient) {}

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
  BonsLivraisonNonFacture():Observable<BonLivraison[]>{
    return this.http.get<BonLivraison[]>(`${this.apiUrl}/Nonfacture`,)
  }
  downloadPdf(numeroBon: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf/${numeroBon}`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
  }
}