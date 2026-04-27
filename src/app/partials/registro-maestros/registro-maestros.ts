import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MaestrosService } from '../../services/maestros-service';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-registro-maestros',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './registro-maestros.html',
  styleUrl: './registro-maestros.scss',
})
export class RegistroMaestros implements OnInit {

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
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private location: Location,
    private router: Router,
    private maestrosService: MaestrosService,
    private notificationService: NotificationService
  ) { }

 ngOnInit() {
  // Inicializamos el objeto con el esquema del servicio
  this.maestro = this.maestrosService.esquemaMaestro();
  // Asignamos el rol
  this.maestro.rol = this.rol;
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

 public registrar() {
  this.errors = {};

  // Validar datos
  this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);

  if(Object.keys(this.errors).length > 0){
    console.log("Errores de validación:", this.errors);
    this.notificationService.error("Revisa los campos obligatorios");
    return;
  }

  // Validar contraseñas
  if(this.maestro.password === this.maestro.confirmar_password){

    // AQUÍ ES DONDE HACEMOS LA CONEXIÓN REAL:
    this.maestrosService.registrarMaestro(this.maestro).subscribe({
      next: (response) => {
        this.notificationService.success("Maestro registrado exitosamente");
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error("Error en el servidor:", err);
        // Si Django manda el mensaje de 'Email ya existe', lo mostramos
        const msg = err.error?.message || "No se pudo registrar al maestro";
        this.notificationService.error(msg);
      }
    });

  } else {
    this.notificationService.error("Las contraseñas no coinciden");
    this.maestro.password = "";
    this.maestro.confirmar_password = "";
  }
}

  public actualizar(){

  }



  //Función para detectar el cambio de fecha
 public changeFecha(event: any) {
  if (event && event.value) {
    const fecha = new Date(event.value);
    if (!isNaN(fecha.getTime())) {
      // Esto asegura que Django reciba YYYY-MM-DD
      this.maestro.fecha_nacimiento = fecha.toISOString().split("T")[0];
    }
  }
}

  // Funciones para los checkbox
  public checkboxChange(event: any) {
  // Si por algo materias_json es undefined, lo inicializamos como arreglo
  if (!this.maestro.materias_json) {
    this.maestro.materias_json = [];
  }

  if (event.checked) {
    // Agregamos la materia
    this.maestro.materias_json.push(event.source.value);
  } else {
    // La quitamos si desmarcan el checkbox
    const index = this.maestro.materias_json.indexOf(event.source.value);
    if (index !== -1) {
      this.maestro.materias_json.splice(index, 1);
    }
  }
  console.log("Materias seleccionadas:", this.maestro.materias_json);
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
