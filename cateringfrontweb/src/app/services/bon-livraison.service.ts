import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { io } from 'socket.io-client';

// ✅ Interface locale pour le typage des réponses
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class BonLivraisonService {
  private apiUrl = 'http://localhost:5000/api/bonLivraison';
  private bonsLivraisonSubject = new BehaviorSubject<any[]>([]);
  private socket: any;

  constructor(private http: HttpClient) {
    this.socket = io(this.apiUrl);
    this.socket.on('bonsLivraisonUpdate', (updatedBonsLivraison: any[]) => {
      this.bonsLivraisonSubject.next(updatedBonsLivraison);
    });
  }

  getBonByVolId(volId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/vol/${volId}`);
  }

  createBonLivraison(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/add`, data);
  }

  getAllBonsLivraison(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/all`).pipe(
      map(response => {
        if (response.success) {
          this.bonsLivraisonSubject.next(response.data);
        }
        return response;
      })
    );
  }

  getBonsLivraisonRealTime(): Observable<any[]> {
    return this.bonsLivraisonSubject.asObservable();
  }

  cancelBonLivraison(numeroBon: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/${numeroBon}/statut`, {
      statut: 'Annulé'
    });
  }

  deleteBonLivraison(bonId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${bonId}`);
  }

  downloadPdf(numeroBon: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf/${numeroBon}`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
  }

  // Méthode publique pour déconnecter le socket
  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}