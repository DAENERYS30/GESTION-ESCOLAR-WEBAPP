import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { NgxMaskDirective } from "ngx-mask"; // Importante para las máscaras de edad y teléfono
import { Router } from '@angular/router';
import { Location } from '@angular/common';
// Asumo que tienes un servicio para alumnos. Ajusta la ruta según tu proyecto:
import { AlumnosService } from '../../services/alumnos-service';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-registro-alumnos',
  imports: [
    ...SHARED_IMPORTS,
    NgxMaskDirective // Agregado aquí
  ],
  templateUrl: './registro-alumnos.html',
  styleUrl: './registro-alumnos.scss',
})
export class RegistroAlumnos implements OnInit {

  @Input() rol:string = "";
  @Input() datos_user:any = {};

  public alumno: any = {};
  public errors: any = {};
  public editar:boolean = false;
  public idUser: number = 0;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    private router: Router,
    private alumnosService: AlumnosService, // Inyectamos el servicio de alumnos
    private notificationService: NotificationService // Inyectamos notificaciones
  ) { }

  ngOnInit() {
    // Inicializar el objeto alumno con el esquema definido en tu servicio
    this.alumno = this.alumnosService.esquemaAlumno();
    // Asignar el rol al alumno
    this.alumno.rol = this.rol;
  }

  //Funciones para password
  public showPassword() {
    if(this.inputType_1 === 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar() {
    if(this.inputType_2 === 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar() {
    // Limpiamos errores previos
    this.errors = {};
    console.log("Datos del alumno: ", this.alumno);

    // Validar datos y mostrar errores (asegúrate de tener esta función en tu AlumnosService)
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);

    // Verificamos si hay errores de validación
    if(Object.keys(this.errors).length > 0){
      return;
    }

    // Validar coincidencia de contraseñas
    if(this.alumno.password === this.alumno.confirmar_password) {
      // Registrar al alumno
      this.alumnosService.registrarAlumno(this.alumno).subscribe({
        next: (response) => {
          this.notificationService.success("Alumno registrado exitosamente");
          console.log(response);
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error("Error al registrar alumno: ", error);
          this.notificationService.error("Error al registrar alumno");
        }
      });
    } else {
      this.notificationService.error("Las contraseñas no coinciden");
      this.alumno.password = "";
      this.alumno.confirmar_password = "";
    }
  }

  public actualizar() {
    // Lógica pendiente para actualizar
  }

  // Función para detectar el cambio de fecha
  public changeFecha(event :any){
    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
  }

  // Funciones para los checkbox (materias)
  public checkboxChange(event:any){
    if(event.checked){
      this.alumno.materias_json.push(event.source.value);
    } else {
      this.alumno.materias_json.forEach((materia: any, i: any) => {
        if(materia === event.source.value){
          this.alumno.materias_json.splice(i,1);
        }
      });
    }
  }

  public revisarSeleccion(nombre: string){
    if(this.alumno.materias_json){
      const busqueda = this.alumno.materias_json.find((element: string)=>element===nombre);
      return busqueda !== undefined;
    }
    return false;
  }
}
