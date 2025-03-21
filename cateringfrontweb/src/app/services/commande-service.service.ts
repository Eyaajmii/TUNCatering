import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const  commandeURL="http://localhost:5000/api/commande";

@Injectable({
  providedIn: 'root'
})
export class CommandeServiceService {

  constructor(private http:HttpClient) { }
  CommanderMenu(formData:FormData):Observable<any>{
    return this.http.post<any>(`${commandeURL}/addCommandeMenu`,formData);
  }
}
