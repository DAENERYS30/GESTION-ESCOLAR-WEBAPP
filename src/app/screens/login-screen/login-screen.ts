import { Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login-screen',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.scss',
})
export class LoginScreen implements OnInit {
  // Aqui van las variables globales
  public username: string = '';
  public password: string = '';
  public load: boolean = false;
  public errors: any = {};
  public type: string = 'password';

  constructor(
    public router: Router  //aqui van las dependecias
  ) { }

  ngOnInit() {

  }
  public login() {

  }
  public registrar() {

  }

  public showPassword() {
    if (this.type === 'password') {
      this.type = 'text'; // Muestra las letras
    } else {
      this.type = 'password'; // Vuelve a poner los puntitos
    }
  }

}
