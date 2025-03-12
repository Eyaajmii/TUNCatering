import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const  URL="http://localhost:5000/api/meal";
export interface Plat{
  _id?: string;
  nom:string;
  description:string;
  image?:string;
  typePlat:string;
  prix:number;
  Desponibilite:boolean;
  adminTn:string
}

@Injectable({
  providedIn: 'root'
})
export class PlatServiceService {

  constructor(private http:HttpClient) { }
  creerPlat(meal:Plat):Observable<Plat>{
    return this.http.post<Plat>(`${URL}/add`, meal);
  }
  getallPlats():Observable<Plat[]>{
    return this.http.get<Plat[]>(`${URL}`);
  }
  getPlatById(id:string):Observable<Plat>{
    return this.http.get<Plat>(`${URL}/${id}`);
  }
  updatePlat(id:string,meal:Plat):Observable<Plat>{
    return this.http.put<Plat>(`${URL}/updateMeal/${id}`, meal);
  }
  supprimerPlat(id:string):Observable<void>{
    return this.http.delete<void>(`${URL}/${id}`);
  }
}
