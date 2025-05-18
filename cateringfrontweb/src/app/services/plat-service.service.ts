import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const  URL="http://localhost:5000/api/meal";
export interface Plat{
  _id?: string;
  nom:string;
  description:string;
  image?:string;
  typePlat:string;
  prix:number;
  Disponibilite:boolean;
  Categorie:string;
  quantite:number;
  //adminTn:string
}

@Injectable({
  providedIn: 'root'
})
export class PlatServiceService {
  constructor(private http:HttpClient) { }
  //ajouter plat
  creerPlat(formData:FormData):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.post<any>(`${URL}/add`,formData,{headers});
  }
  //donner tous les plats
  getallPlats():Observable<Plat[]>{
    return this.http.get<Plat[]>(`${URL}/`);
  }
  //donner un plat specifique
  getPlatById(id:string):Observable<Plat>{
    return this.http.get<Plat>(`${URL}/Plat/${id}`);
  }
  //mise a jour plat
  updatePlat(id:string,meal:Plat):Observable<Plat>{
    return this.http.put<Plat>(`${URL}/updateMeal/${id}`, meal);
  }
  //supprimer plat
  supprimerPlat(id:string):Observable<void>{
    return this.http.delete<void>(`${URL}/${id}`);
  }
}
