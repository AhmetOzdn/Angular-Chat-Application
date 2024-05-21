import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  error:string = "";
  registerFormControl(registerForm: NgForm) {

    if (registerForm.invalid) {
      return;
    } else {
      const email = registerForm.value.email;
      const password = registerForm.value.password;
      const firstName = registerForm.value.firstName;
      const lastName = registerForm.value.lastName;
      this.authService
        .register(email, password, firstName, lastName)
        .subscribe({
          next: (result) => {
            console.log(result);
            this.router.navigate(['/']);
          },

          error: (err) => {
            this.error = err;
             console.log('Register Hata Mesajı',err);
          },
        });
    }
  }
}
