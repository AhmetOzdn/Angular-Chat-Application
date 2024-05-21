import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatResponseModel } from '../Models/chatModel';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  MainUrl = 'http://localhost:60805/api/';
  getChatUrl = this.MainUrl + 'ChatUsers/GetListByUserId';
  constructor(private http: HttpClient) { }

  getChats(): Observable<ChatResponseModel> {
    return this.http.get<ChatResponseModel>(this.getChatUrl);
  }
}
