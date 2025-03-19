import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const  menuURL="http://localhost:5000/api/menu";
const platURL="http://localhost:5000/api/meal";

export interface Plat{
  _id?: string;
  nom:string;
  description:string;
  image?:string;
  typePlat:string;
  prix:number;
  Disponibilite:boolean;
  Categorie:string
  //adminTn:string
}
export interface Menu{
  _id?: string;
  nom:string;
  PlatsPrincipaux:Plat;
  PlatsEntree:Plat;
  PlatsDessert:Plat;
}
@Injectable({
  providedIn: 'root'
})
export class MenuServiceService {

  constructor(private http:HttpClient) { }
  /*TousPlats():Observable<Plat[]>{
    return this.http.get<Plat[]>(`${platURL}/`);
  }*/
 TousPrincipaux():Observable<Plat[]>{
  return this.http.get<Plat[]>(`${platURL}/type/Plat Principal`);
 }
 TousEntree():Observable<Plat[]>{
  return this.http.get<Plat[]>(`${platURL}/type/Entrée`);
 }
 TousDessert():Observable<Plat[]>{
  return this.http.get<Plat[]>(`${platURL}/type/Dessert`);
 }
  creerMenu(data:any):Observable<any>{
    return this.http.post<any>(`${menuURL}/add`,data);
  }
  TousMenu():Observable<Menu[]>{
    return this.http.get<Menu[]>(`${menuURL}/`);
  }
}
