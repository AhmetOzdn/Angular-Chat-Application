import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../../Services/signalr.service';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  isAuthenticated: boolean = false;
  constructor(
    private authService: AuthService,
    private signalrService: SignalrService,
    private cookieService: CookieService
  ) {
    
  }

  ngOnInit(): void {
   
    this.authService.tokenModel.subscribe((response) => {
      this.isAuthenticated = !!response;
    });
  }

  logOut() {
    this.disconnectConfigureConnectionId();
    this.authService.logOut();
    window.location.reload();
  }

  disconnectConfigureConnectionId() {
    this.signalrService.disconnectConfigureConnectionId(JSON.parse(this.cookieService.get('userId')));
  }
}
