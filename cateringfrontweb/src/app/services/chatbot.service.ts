import { HttpClient,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private ChatbotURL = "http://localhost:5000/api/chatbot"; 

  constructor(private http:HttpClient) { }
  EnvoyerMessage(message:string):Observable<any>{
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.post(`${this.ChatbotURL}/message`, {message}, {headers})
  }
}
