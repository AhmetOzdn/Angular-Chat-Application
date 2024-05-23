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
import { ListenMessageModel } from '../../Models/listenMessageModel';

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
  isMyClientBoool: boolean = false;
  userNumber!: number;
  selectedChat: ChatModel | null = null; // Seçilen sohbeti saklar
  isVisible: boolean = true;
  Users!: UserModel;
  userChats: ChatModel[] = [];
  private messageSubscription: Subscription | undefined;
  messages: MessageModel[] = [];
  newMessage: string = '';
  chatId: number | null = null;

  // bu for ile behaviour subject,'ten aldığımız mesajları yazdırmak için kullanıyoruz
  public chatMessageArray: MessageModel[] = [];

  constructor(
    private dialog: MatDialog,
    private signalrService: SignalrService,
    private userService: UserService,
    private cookieService: CookieService,
    private chatService: ChatService
  ) {
    this.signalrService
      .connectStart()
      .then(() => {this.connectConfigureConnectionId()} )
      .catch((error) => console.error('Bağlantı başlatılamadı:', error));

    //Hello User Animasyonu için
    setTimeout(() => {
      this.isVisible = false;
    }, 3000);

    //bu kodun amacı behaviour subject,'ten aldığımız mesajları yazdırmak için kullanıyoruz ama kullanmadan önce eğer gelen mesaj boş ise bunu filtreleyerek kullanıcıya gösterilmesini engelliyoruz
    this.signalrService.chatMessageSubject.subscribe((chatMessage) => {
      const filteredMessages = chatMessage.filter(element => element.text !== "");
      if (filteredMessages.length > 0) {
        this.chatMessageArray = filteredMessages;
      }
    });

    //bu kodun amacı behaviour subject,'ten aldığımız mesajları anlık olarak yazdırmak için "messageSubscription" a eşitliyoruz kullanıyoruz
    this.messageSubscription = this.signalrService.newMessageSubject.subscribe(
      (message) => {
         debugger;
        if (message && this.selectedChat?.chatId === this.chatId && message.text !== '') {
          this.chatMessageArray.push(message);
        }
      }
    );

    this.signalrService.listenMessage();
    this.signalrService.listenChatMessage();
  }

  ngOnInit(): void {
    this.getUsers();
    this.getChats();
    window.addEventListener('beforeunload', () => this.disconnect());
    this.getChatIdFromOnlineMessage();
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  // burada anlık olarak gönderdiğimiz mesajlardan dönen chatId'yi alıyoruz.
  getChatIdFromOnlineMessage() {
    this.signalrService.newChatId.subscribe((chatId) => {
      if (chatId) {
         debugger;
        console.log(chatId);
        this.chatId = chatId;
      }
    });
  }

  // Mesaj Yollamak için kullanıyoruz
  sendMessage(chatid: number): void {
    const message: MessageModel = {
      userId: JSON.parse(this.cookieService.get('userId')),
      text: this.newMessage,
      postDate: new Date().getTime(),
    };
    if (message.text !== '') {
      this.signalrService.sendMessage(chatid, message);
      this.newMessage = '';
    } else {
      debugger;
      const message: MessageModel = {
        userId: JSON.parse(this.cookieService.get('userId')),
        text: '',
        postDate: new Date().getTime(),
      };
      this.signalrService.sendMessage(chatid, message);
    }
  }

  // Sohbeti Seçmek için kullanıyoruz
  selectUserChat(chat: ChatModel, chatid: number): void {
    this.selectedChat = chat;
    // debugger
    this.signalrService.invokeChatMessage(chatid);
    this.messages = []; // Eski mesajları temizleyin
    this.signalrService.listenChatMessage();
    this.sendMessage(chatid); // Mesaj Yollamak için kullanıyoruz fakat burada kullanmamızın amacı kullanıcılar chat'i seçtiklerinde chatid'yi almak

    
  }

  // kullanıcının hangi tarafta mesajlarının görünmesinin sorgusunu burada yapıyoruz
  isMyClient(userId: number) {
    const usercookieid = JSON.parse(this.cookieService.get('userId'));
    if (usercookieid === userId) {
      return (this.isMyClientBoool = true);
    } else {
      return (this.isMyClientBoool = false);
    }
  }

  //Sohbetleri Burada yazdırıyoruz
  getChats(): void {
    this.chatService.getChats().subscribe((chats) => {
      this.userChats = chats.items;
    });
  }

  //Kullanıcı bilgisini burada yazdırıyoruz
  getUsers(): void {
    this.userService.getFromAuthUsers().subscribe((users) => {
      this.Users = users;
      // console.log(users);
      this.cookieService.set('userId', JSON.stringify(this.Users.id));
    });
  }

  //SignalR'a burada ilk bağlantı isteğini yolluyoruz
  connectConfigureConnectionId(): void {
    this.signalrService.connectConfigureConnectionId(this.Users.id);
  }

  //Online Userların popUp içinde açılmasını sağlıyoruz
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

  // Disconnect işlemini burada yapıyoruz
  disconnect(): void {
    this.signalrService.disconnectConfigureConnectionId(this.Users.id);
  }

  //Cookiedeki userId'yi buradan alabiliriz
  getCookieId() {
    this.userNumber = JSON.parse(this.cookieService.get('userId'));
  }
}
