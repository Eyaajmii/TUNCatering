import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const FactureURL = "http://localhost:5000/api/facture"; 
@Injectable({
  providedIn: 'root'
})
export class FactureService {

  constructor(private http: HttpClient) { }
  ajouterFacture(date:string):Observable<any>{
    return this.http.post<any>(`${FactureURL}/addFacture`,{date});
   }
}
