import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SignalrService } from '../../Services/signalr.service';
import { UserModel } from '../../Models/UserModel';
import { UserService } from '../../Services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { ChatService } from '../../Services/chat.service';
import { ChatModel } from '../../Models/chatModel';
import { MessageModel } from '../../Models/messageModel';
import { Subscription } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { UserActivePopUpComponent } from './user-active-pop-up/user-active-pop-up.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, MatDialogModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeInOutAnimation', [
      state(
        'void',
        style({
          opacity: 0,
        })
      ),
      transition('void <=> *', animate('2s ease-in-out')),
    ]),
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  isMyClientBoool:boolean = false;
  userNumber!:number;
  selectedChat: ChatModel | null = null; // Seçilen sohbeti saklar
  isVisible: boolean = true;
  Users!: UserModel;
  userChats: ChatModel[] = [];

  private messageSubscription: Subscription | undefined;
  messages: MessageModel[] = [];
  newMessage: string = '';

  // bu for ile behaviour subject,'ten aldığımız mesajları yazdırmak için kullanıyoruz
  public chatMessageArray: MessageModel[] = [];

  constructor(
    private dialog: MatDialog,
    private signalrService: SignalrService,
    private userService: UserService,
    private cookieService: CookieService,
    private chatService: ChatService
  ) {
    this.signalrService.connectStart()
      .then(() => this.connectConfigureConnectionId())
      .catch(error => console.error('Bağlantı başlatılamadı:', error));

    //Hello User Animation
    setTimeout(() => {
      this.isVisible = false;
    }, 5000);

    //bu behaviour subject,'ten aldığımız mesajları yazdırmak için kullanıyoruz
    this.signalrService.chatMessageSubject.subscribe((chatMessage) => {   
      if(chatMessage){
        this.chatMessageArray = chatMessage ;
        // console.log(this.chatMessageArray);
      }
    })
    this.signalrService.listenMessage();
    this.signalrService.listenChatMessage();
  }

  ngOnInit(): void {
    this.getUsers();
    window.addEventListener('beforeunload', () => this.disconnect());
    this.getChats();

    // anlık mesajlar behavvioyur subjectten buraya gelip buradan chatMessageArray'a atıyoruz
    this.messageSubscription = this.signalrService.newMessageSubject.subscribe((message) => {
      if (message) {
        this.chatMessageArray.push(message,);
      }});
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  isMyClient(userId:number){
    const usercookieid = JSON.parse(this.cookieService.get("userId"));
    if(usercookieid === userId){
     return this.isMyClientBoool = true;
    }else{
      return this.isMyClientBoool = false;
    }
  }

  sendMessage(chatid: number): void {
    const message: MessageModel = {
      userId: JSON.parse(this.cookieService.get('userId')),
      text: this.newMessage,
      postDate: new Date().getTime(),
    };
    if(message.text !== ""){
      this.signalrService.sendMessage(chatid,message);
      this.newMessage = '';
    }else{
      alert("Lütfen bir mesaj girin");
    }
    
    
  }



  getChats(): void {
    this.chatService.getChats().subscribe((chats) => {
      this.userChats = chats.items;
    });
  }

  getUsers(): void {
    this.userService.getFromAuthUsers().subscribe((users) => {
      this.Users = users;
      console.log(users);
      this.cookieService.set('userId', JSON.stringify(this.Users.id));
    });
  }

  connectConfigureConnectionId(): void {
    this.signalrService.connectConfigureConnectionId(this.Users.id);
  }

  // kullanıcıyı
  selectUser(chat: ChatModel,chatid:number): void {
    this.selectedChat = chat;
    this.signalrService.invokeChatMessage(chatid);
    this.messages = []; // Eski mesajları temizleyin
    this.signalrService.listenChatMessage()
  }

  

  openOnlineUserActivePage(): void {
    this.dialog.open(UserActivePopUpComponent, {
      width: '25%',
      height: 'auto',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      data: {
        id: this.Users.id,
        firstName: this.Users.firstName,
        lastName: this.Users.lastName,
      },
    });
    this.signalrService.invokeHub();
    this.signalrService.listenHub();
  }

  disconnect(): void {
    this.signalrService.disconnectConfigureConnectionId(this.Users.id);
  }

  getCookieId(){
    debugger
    this.userNumber = JSON.parse(this.cookieService.get("userId"));
  }
}
