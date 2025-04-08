import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BonLivraisonService {
  private apiUrl = 'http://localhost:5000/api/bonLivraison'; // Gardez cette URL de base

  constructor(private http: HttpClient) {}

  getBonByVolId(volId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/vol/${volId}`);
  }

  createBonLivraison(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  downloadPdf(numeroBon: string): Observable<Blob> {
    // Utilisez directement apiUrl sans ajouter de préfixe supplémentaire
    return this.http.get(`${this.apiUrl}/pdf/${numeroBon}`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
  }
}