import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-registro-maestros',
  imports: [],
  templateUrl: './registro-maestros.html',
  styleUrl: './registro-maestros.scss',
})
export class RegistroMaestros {

  @Input() rol:string = "";
  @Input() datos_user:any = {};

}
