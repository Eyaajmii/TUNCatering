import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const statUrl='http://localhost:5000/api/statistique'
export interface Statistique {
  allOrders: number;
  numberOfMenus: number;
  numberOfPlats: number;
  topMenus: { nom: string; count: number }[];
  topPlats: { nom: string; count: number }[];
}
@Injectable({
  providedIn: 'root'
})
export class StatService {

  constructor(private http:HttpClient) { }
  getStat():Observable<Statistique>{
    return this.http.get<Statistique>(`${statUrl}/statistiqueDash`);
  }

}
