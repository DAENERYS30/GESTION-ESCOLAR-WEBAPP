import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-registro-alumnos',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './registro-alumnos.html',
  styleUrl: './registro-alumnos.scss',
})
export class RegistroAlumnos  implements OnInit {

  @Input() rol:string = "";
  @Input() datos_user:any = {};

  public maestro: any = {};
  public errors: any = {};
  public editar:boolean = false;
  public idUser: number = 0;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  //Para el select
  public areas: any[] = [

    {value: '1', viewValue: 'Ingeneria en Ciencias De la computacion'},
    {value: '1', viewValue: 'Licenciatura en Ciencias De la computacion'},
    {value: '1', viewValue: 'Ingeneria en Ciberseguridad'},
    {value: '1', viewValue: 'Ingeneria en Ciencias De Datos'},
  ];

  public materias:any[] = [
     {value: '1', nombre: 'Desarrollo Web'},
    {value: '2', nombre: 'Programación'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre:'Redes'},
    {value: '5', nombre: 'Matemáticas'},





  ];

  constructor(
    private location: Location,
    private router: Router
  ) { }

  ngOnInit() {
  }

  //Funciones para password
  public showPassword()
  {
    if(this.inputType_1 === 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar()
  {
    if(this.inputType_2 === 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){

  }

  public actualizar(){

  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
  }

  // Funciones para los checkbox
  public checkboxChange(event:any){
    if(event.checked){
      this.maestro.materias_json.push(event.source.value)
    }else{
      this.maestro.materias_json.forEach((materia: any, i: any) => {
        if(materia === event.source.value){
          this.maestro.materias_json.splice(i,1)
        }
      });
    }
  }

  public revisarSeleccion(nombre: string){
    if(this.maestro.materias_json){
      const busqueda = this.maestro.materias_json.find((element: string)=>element===nombre);
      if(busqueda !== undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

}
