import { Component } from '@angular/core';
import {AuthService} from "@core/auth/auth.service";
import {Router} from "@angular/router";
import {UntypedFormControl, UntypedFormGroup} from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  invalidCredentialMsg!: string;
  constructor(private authService: AuthService, private router: Router) {
  }
  loginForm = new UntypedFormGroup({
    username: new UntypedFormControl(),
    password: new UntypedFormControl()
  });
  onFormSubmit() {
    let uname = this.loginForm.get('username')!.value;
    let pwd = this.loginForm.get('password')!.value;
    this.authService.isUserAuthenticated(uname, pwd).subscribe(
      authenticated => {
        if(authenticated) {
          let url =  this.authService.getRedirectUrl();
          console.log('Redirect Url:'+ url);
          this.router.navigate([ url ]);
        } else {
          this.invalidCredentialMsg = 'Invalid Credentials. Try again.';
        }
      }
    );
  }
}
