import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { CookieService } from 'ngx-cookie-service';
import { UserModel } from '../Models/UserModel';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageModel } from '../Models/messageModel';
import { ListenMessageModel } from '../Models/listenMessageModel';
@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;
  public onlineUsersSubject: BehaviorSubject<UserModel[]> = new BehaviorSubject< UserModel[]>([]);
  public newMessageSubject = new BehaviorSubject<MessageModel | null>(null);
  private newChatIdSubject = new BehaviorSubject<number | null>(null);
  public newChatId = this.newChatIdSubject.asObservable();
  public chatMessageSubject = new BehaviorSubject<MessageModel[]>([]);
  newChatId$: any;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cookieService: CookieService
  ) {
    this.hubBuild();
  }

  hubBuild() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:60805/ChatHub')
      .withAutomaticReconnect([1000, 2000, 5000, 10000]) // burada başlangıçta 1 saniyede sonrasında 2 daha sonra 5 ve en sonunda 10 sanidye sonra tekrar bağlanmaya çalışır
      .build();
  }

  // bu fonksiyonun amacı eğer bağlantı hiç kurulmadıysa hubConnection'u başlatır error durumunda ise 2 sn sonra fonksiyonu  tekrar çalıştırır
  connectStart(): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('HubConnection not initialized');
    }

    return this.hubConnection
      .start()
      .then(() => {
        console.log('Hub a Başarıyla bağlandı...');
      })
      .catch((error) => {
        console.error('Hub a Bağlantı hatası:', error);
        setTimeout(() => this.connectStart(), 2000);
        throw error; // Hatanın yeniden atılması
      });
  }

  invokeHub() {
    this.hubConnection?.invoke('GetListActiveUsersAsync');
  }

  invokeCreateChat(userIdArray: number[]) {
    this.hubConnection?.invoke('CreateChat', userIdArray);
  }

  
  // Mesaj Göndermek için
   sendMessage(chatId:number,message: MessageModel) {
    this.hubConnection?.invoke('SendMessage', chatId,message)
      .then(() => console.log('Mesaj başarıyla gönderildi'))
      .catch((err) => console.error('Mesaj gönderme hatası : ', err));
  }

  invokeChatMessage(chatId:number){
    this.hubConnection?.invoke('GetChatAsync',chatId)
  }

  listenChatMessage(){
    this.hubConnection?.on('chatLastMessage', (message) => {
      this.chatMessageSubject.next(message);
      setTimeout(() => {
        this.hubConnection?.off('chatLastMessage');
      }, 100);
    });
  }

  listenMessage(): void {
    this.hubConnection?.on('receivedMessage',(message,chatId) =>{
       console.log(chatId);
      this.newMessageSubject.next(message);
      this.newChatIdSubject.next(chatId);
    })
  }

  // listenMessage(): Observable<ListenMessageModel> {
  //   return new Observable<ListenMessageModel>(observer => {
  //     this.hubConnection?.on('receivedMessage', (message: MessageModel, chatId: number) => {
  //       console.log(message, chatId);
  //       let result: ListenMessageModel = {
  //         message: message,
  //         chatId: chatId,
  //       };
  //       observer.next(result);
  //     });
  //   });
  // }

  listenHub() {
    this.hubConnection?.on('getListActiveUsers', (users) => {
      console.log('Aktif kullanıcılar listesi alındı: ', users.items);
      this.onlineUsersSubject.next(users.items);
    });
    setTimeout(() => {
      this.hubConnection?.off('getListActiveUsers');
    }, 1000);
  }

  connectConfigureConnectionId(userId: number) {
    this.hubConnection
      ?.invoke('ConnectConfigureConnectionId', userId)
      .then(() => console.log("Bağlantı ID'si yapılandırıldı."))
      .catch((err) =>
        console.error("Bağlantı ID'si yapılandırılırken hata oluştu: ", err)
      );
  }

  disconnectConfigureConnectionId(userId: number) {
    this.hubConnection
      ?.invoke('DisconnectConfigureConnectionId', userId)
      .then(() => console.log("Bağlantı ID'si kaldırıldı."))
      .catch((err) =>
        console.error("Bağlantı ID'si kaldırılırken hata oluştu: ", err)
      );
  }

  getListActiveUsers(chatHubId: string) {
    this.hubConnection?.on(chatHubId, (message) => {
      console.log('Aktif kullanıcılar listesi alındı: ', message);
      // Burada kullanıcının listesini alıyoruz
    });
  }




  //?yeniden bağlanmaya çalışırken
  reConnect() {
    this.hubConnection?.onreconnecting((error) => {});
  }

  //?yeniden bağlandığında
  Connect() {
    this.hubConnection?.onreconnected((conncectionId) => {});
  }

  //?yeniden bağlanamadığında
   disconnect() {
     this.hubConnection?.onclose(() => {
    });
   }
}
