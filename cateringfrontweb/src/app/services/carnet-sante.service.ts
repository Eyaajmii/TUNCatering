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
  AfficherCarnetSante():Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get(`${this.CarnetsanteURL}/Carnet`,{headers});
  }
  ModifierCarnetSante(data:any):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.put(`${this.CarnetsanteURL}/updateCarnet`,data,{headers});
  }
  AnnulerCarnetSante():Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.delete(`${this.CarnetsanteURL}/supprimer`,{headers});
  }
}
