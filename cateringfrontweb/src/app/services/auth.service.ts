import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url='http://localhost:5000/api/auth';
  constructor(private http:HttpClient) { }
  login(username: string, Matricule:string,password: string):Observable<any>{
    return this.http.post(`${this.url}/authentification`, {username, Matricule,password});
  }
  //fait par l'administrateur
  register(data:any):Observable<any>{
    return this.http.post(`${this.url}/register`,data);
  }
  saveToken(token:string):void{
    localStorage.setItem('token',token);
  }
  getToken():string|null{
    return localStorage.getItem('token');
  }
  logout():void{
    localStorage.removeItem('token');
  }
  isAuthenticated():boolean{
    return this.getToken() !== null;
  }
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (e) {
      console.error("Erreur de décodage du token :", e);
      return null;
    }
  }
}

