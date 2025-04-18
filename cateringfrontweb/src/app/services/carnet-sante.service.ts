import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarnetSanteService {
  private CarnetsanteURL = "http://localhost:5000/api/carnetsante"; 
  constructor(private http:HttpClient) { }
  AjouterCarnetSante(data:any):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post(`${this.CarnetsanteURL}/addCarnet`, data, {headers});
  }
}
