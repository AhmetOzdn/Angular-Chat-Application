import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { RegisterModel } from '../Models/register.model';
import { JwtTokenModel } from '../Models/JwtTokenModel';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}
  MainUrl = 'http://localhost:60805/';
  loginUrl = this.MainUrl + 'api/Auth/Login';
  registerUrl = this.MainUrl + 'api/Auth/Register';
  refreshTokenUrl = this.MainUrl + 'api/Auth/RefreshToken';
  credentials = { withCredentials: true };
  tokenModel = new BehaviorSubject<JwtTokenModel | null>(null);
  isLogin:boolean= false;
  
  login(email: string, password: string) {
    const loginObject = {
      email: email,
      password: password,
    };

    return this.http
      .post<JwtTokenModel>(this.loginUrl, loginObject, this.credentials)
      .pipe(
        tap((response) => {
          this.handleJWTToken(response.accessToken.token, response.accessToken.expirationDate);
          this.cookieService.set('AccesToken', JSON.stringify(response.accessToken));
          this.isLogin= true
          this.router.navigateByUrl('/');
      }),
        catchError(this.handleError)
       
      );

  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    const registerObject = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    };
    return this.http
      .post<RegisterModel>(this.registerUrl, registerObject, this.credentials)
      .pipe(
        tap((response) => {
          this.cookieService.set('AccesToken', JSON.stringify(response));
        }),
        catchError(this.handleError)
      );
  }

  private handleJWTToken(token: string, expirationDate: Date) {
    const jwtToken: JwtTokenModel = { 
        accessToken: { 
            token: token, 
            expirationDate: expirationDate 
        }, 
        requiredAuthenticatorType: null 
    };
    
    this.tokenModel.next(jwtToken);
    console.log(jwtToken);
    this.cookieService.set('AccesToken', JSON.stringify(jwtToken));
}

  private handleError(err: HttpErrorResponse) {
    // let message = err.error.detail;  hata mesajları aktif olunca burayı kullan
    let message = err;
    return throwError(() => message);
  }

  autoLogin() {
    const cookieToken = this.cookieService.get('AccesToken');
    if (cookieToken === null || cookieToken === '') {
      return;
    } else {
      const jwtToken = JSON.parse(cookieToken);
      const loadedJwtToken: JwtTokenModel = {
        accessToken: {
          token: jwtToken.token,
          expirationDate: new Date(jwtToken.expiration)
        },
        requiredAuthenticatorType: null
      };
      this.tokenModel.next(loadedJwtToken);
    }
}

  isAuthenticated() {
    if (this.cookieService.get('AccesToken')) {
      return true;
    } 
    else this.logOut();
    return false;
  }

  logOut() {
    this.tokenModel.next(null);
    this.cookieService.delete('AccesToken');
    this.router.navigate(['/']);
  }


  refreshToken(): Observable<JwtTokenModel> {
    return this.http
      .get<JwtTokenModel>(this.refreshTokenUrl, this.credentials)
      .pipe(
        tap((response) => {
          this.handleJWTToken(response.accessToken.token, response.accessToken.expirationDate);
          console.log(response);
      }),
        catchError(this.handleError)
      );
  }
}
