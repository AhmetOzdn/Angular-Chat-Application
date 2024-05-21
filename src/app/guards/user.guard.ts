import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { map, tap } from 'rxjs';
import { AuthService } from '../Services/auth.service';

export const userGuard: CanActivateFn = (route, state) => {
  const cookieService =  inject(CookieService);
  const authService = inject(AuthService)
  const router = inject(Router)

  return authService.tokenModel.pipe(
    map(tokenModel =>{
         return !!tokenModel 
    }),
    tap(isVisitor =>{
        if(!isVisitor){
            router.navigate(["/login"]);
            cookieService.delete("accesToken");
        }
    })
);



};
