import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginModel } from '../../Models/login.model';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink,CommonModule,HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginModel!: LoginModel;
  constructor(private router: Router, private http: HttpClient,private authService:AuthService) {}
  
  loginFormControl(loginForm: NgForm) {

    if (loginForm.invalid) {
      return;
    } else {
      const email = loginForm.value.email;
      const password = loginForm.value.password;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
           console.log(err);
        },
      });
    }
  }
}
