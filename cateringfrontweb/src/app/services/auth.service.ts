import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url='http://localhost:5000/api/auth';
  constructor(private http:HttpClient) { }
  login(username: string,password: string):Observable<any>{
    return this.http.post(`${this.url}/authentification`, {username,password});
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
  /*logout():void{
    localStorage.removeItem('token');
  }*/
  logout(token: string): Observable<any> {
    return this.http.post(`${this.url}/logout`, { token });
  }
  ModifierUser(data: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(`${this.url}/update`, data, { headers });
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
  getPersonnelTunisairByUsername(username: string) {
    return this.http.get<any>(`http://localhost:5000/api/personnelTunisair/${username}`);
  }
  
}

