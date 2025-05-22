import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const  menuURL="http://localhost:5000/api/menu";
const platURL="http://localhost:5000/api/plat";

export interface Plat{
  _id?: string;
  nom:string;
  description:string;
  image?:string;
  typePlat:string;
  Disponibilite:boolean;
  Categorie:string;
  quantite:number;
  //adminTn:string
}
export interface Menu{
  _id?: string;
  nom:string;
  PlatsPrincipaux:Plat[];
  PlatsEntree:Plat[];
  PlatsDessert:Plat[];
  Boissons:Plat[];
  Disponible:boolean;
}
@Injectable({
  providedIn: 'root'
})
export class MenuServiceService {

  constructor(private http:HttpClient) { }
 TousPrincipaux():Observable<Plat[]>{
  return this.http.get<Plat[]>(`${platURL}/type/Plat Principal`);
 }
 TousEntree():Observable<Plat[]>{
  return this.http.get<Plat[]>(`${platURL}/type/Entrée`);
 }
 TousDessert():Observable<Plat[]>{
  return this.http.get<Plat[]>(`${platURL}/type/Dessert`);
 }
 TousBoissons():Observable<Plat[]>{
  return this.http.get<Plat[]>(`${platURL}/type/Boisson`);
 }
 TouspetitDej():Observable<Plat[]>{
  return this.http.get<Plat[]>(`${platURL}/type/Petit déjuner `);
 }
  creerMenu(data:any):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.post<any>(`${menuURL}/add`,data,{headers});
  }
  TousMenu():Observable<Menu[]>{
    return this.http.get<Menu[]>(`${menuURL}/`);
  }
  modifierMenu(id:string,menu:Menu):Observable<Menu>{
    return this.http.put<Menu>(`${menuURL}/updateMenu/${id}`, menu);
  }
  supprimerMenu(id:string):Observable<void>{
    return this.http.delete<void>(`${menuURL}/${id}`);
  }
  getMenubyId(id:string):Observable<Menu>{
    return this.http.get<Menu>(`${menuURL}/Menu/${id}`);
  }
}
