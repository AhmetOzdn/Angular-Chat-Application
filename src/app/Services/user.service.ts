import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserModel } from '../Models/UserModel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  MainUrl = 'http://localhost:60805/api/';
  getFromAuthUrl = this.MainUrl + 'Users/GetFromAuth';
  constructor(private http: HttpClient) {}

  getFromAuthUsers(): Observable<UserModel> {
    return this.http.get<UserModel>(this.getFromAuthUrl);
  }
}
