import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, take, switchMap, catchError, throwError, Observable, filter } from 'rxjs';
import { AuthService } from '../Services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  let isRefreshing = false;
  let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  let isAuthenticated:boolean = false;

  authService.tokenModel.subscribe((response)=>{
    isAuthenticated = !!response;
  })

  return authService.tokenModel.pipe(
    take(1),
    switchMap(tokenModel => {
      if (tokenModel && tokenModel.accessToken.token){
        // && new Date(tokenModel.accessToken.token)< new Date() hata burada
        req = addToken(req, tokenModel.accessToken.token);
      }
      return next(req).pipe(
        catchError(error => {
          if (error.status === 401 && isAuthenticated === true && tokenModel?.accessToken.expirationDate) {   
            if(tokenModel.accessToken.expirationDate > new Date()){
              return handleUnauthorizedError(req, next, authService, refreshTokenSubject, isRefreshing);
            }
            return handleUnauthorizedError(req, next, authService, refreshTokenSubject, isRefreshing);
          } else {
            return throwError(error);

          }
        })
      );
    })
  );
}

function addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handleUnauthorizedError(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, refreshTokenSubject: BehaviorSubject<any>, isRefreshing: boolean): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(newTokenModel => {
        isRefreshing = false;
        refreshTokenSubject.next(newTokenModel.accessToken.token);
        req = addToken(req, newTokenModel.accessToken.token);
        return next(req);
      }),
      catchError(error => {
        isRefreshing = false;
        authService.logOut();
        return throwError(error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => {
        return next(addToken(req, refreshTokenSubject.value));
      })
    );
  }
};
