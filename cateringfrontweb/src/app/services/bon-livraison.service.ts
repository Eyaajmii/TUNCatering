import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BonLivraisonService {
  private apiUrl = 'http://localhost:5000/api/bonLivraison'; 

  constructor(private http: HttpClient) {}

  getBonByVolId(volId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/vol/${volId}`);
  }

  createBonLivraison(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
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
