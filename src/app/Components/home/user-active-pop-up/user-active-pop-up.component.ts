import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserModel } from '../../../Models/UserModel';
import { SignalrService } from '../../../Services/signalr.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-user-active-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-active-pop-up.component.html',
  styleUrl: './user-active-pop-up.component.css',
})
export class UserActivePopUpComponent implements OnInit {
  inputData!: UserModel;
  onlineUsers: UserModel[] = [];
  chatUserIds:number[] = [];
  isEqualUserIdboolean: boolean = false;
  constructor(
    private router: Router,
    private matDialogRef: MatDialogRef<UserActivePopUpComponent>,
    private cookieService: CookieService,
    private signalrService: SignalrService
  ) {}
  // @Inject(MAT_DIALOG_DATA) public data: UserModel üst componentten bilgi çekerisek eğer o zaman kullanılır
  ngOnInit(): void {
    //   this.inputData = this.data; üst componentten bilgi çekerisek eğer o zaman kullanılır
    //   console.log(this.inputData); üst componentten bilgi çekerisek eğer o zaman kullanılır
    this.signalrService.onlineUsersSubject.subscribe((users) => {
      this.onlineUsers = users;
      this.isEqualId();
    });
  }
  loginUserId = JSON.parse(this.cookieService.get('userId'));

  createChat(targetUserId:number) {
    debugger
    this.chatUserIds = [targetUserId,this.loginUserId]

    this.signalrService.invokeCreateChat(this.chatUserIds);
  }

  isEqualUserId(userId: number): boolean {
    //?Bu fonksiyon, bir kullanıcının ID'sinin verilen ID ile eşleşip eşleşmediğini kontrol edecek ve sonucu geri döndürecek.
    const currentUserId = JSON.parse(this.cookieService.get('userId'));
    return userId === currentUserId;
  }

  isEqualId() {
    //?Bu kod, onlineUsers dizisindeki her bir kullanıcının ID'sini kontrol eder. Eğer kullanıcının ID'si userId ile eşleşirse, bu kullanıcıyı diziden çıkarır. Ardından, kullanıcıların listelendiği yani oninit'te bu işlemi çağırarak, kullanıcının kendi bilgilerinin görünmemesini sağlayabiliriz.
    const userId = JSON.parse(this.cookieService.get('userId'));
    const index = this.onlineUsers.findIndex((user) => user.id === userId);
    if (index !== -1) {
      this.onlineUsers.splice(index, 1); // Kullanıcının bilgilerini diziden çıkar
    }
  }

  //!Close Pop Up
  closePopUp() {
    this.matDialogRef.close();
  }
}
