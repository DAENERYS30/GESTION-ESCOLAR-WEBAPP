import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { NgxMaskDirective } from "ngx-mask";
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from '../../services/alumnos-service';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-registro-alumnos',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    NgxMaskDirective
  ],
  templateUrl: './registro-alumnos.html',
  styleUrl: './registro-alumnos.scss',
})
export class RegistroAlumnos implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public alumno: any = {};
  public errors: any = {};
  public editar: boolean = false;

  // Variables para ocultar/mostrar contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    private router: Router,
    private alumnosService: AlumnosService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    // 1. Inicializamos el objeto con los campos vacíos del servicio
    this.alumno = this.alumnosService.esquemaAlumno();
    // 2. Forzamos el rol a 'alumno'
    this.alumno.rol = 'alumno';
  }

  /**
   * Lógica para el botón Registrar
   */
  public registrar() {
    this.errors = {};
    console.log("Enviando datos del alumno: ", this.alumno);

    // Validamos los campos (Asegúrate que validarAlumno existe en tu servicio)
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);

    if (Object.keys(this.errors).length > 0) {
      this.notificationService.error("Por favor, revisa los campos marcados.");
      return;
    }

    // Validación de contraseñas coincidentes
    if (this.alumno.password !== this.alumno.confirmar_password) {
      this.notificationService.error("Las contraseñas no coinciden");
      return;
    }

    // Igualamos el username al email para que Django no se queje
    this.alumno.username = this.alumno.email;

    // Petición HTTP a Django
    this.alumnosService.registrarAlumno(this.alumno).subscribe({
      next: (response) => {
        this.notificationService.success("¡Alumno guardado correctamente!");
        this.router.navigate(['']); // Redirige al login o inicio
      },
      error: (err) => {
        console.error("Error en el servidor:", err);
        this.notificationService.error("No se pudo registrar al alumno.");
      }
    });
  }

  public changeFecha(event: any) {
  // Verificamos que el evento y el valor existan para no tronar el sistema
  if (event && event.value) {
    const fecha = new Date(event.value);

    // Si la fecha es válida, la formateamos para Django (YYYY-MM-DD)
    if (!isNaN(fecha.getTime())) {
      this.alumno.fecha_nacimiento = fecha.toISOString().split("T")[0];
    }
  } else {
    // Si el usuario borra la fecha del calendario, la dejamos vacía
    this.alumno.fecha_nacimiento = "";
  }
}

  // --- Funciones de Utilidad ---

  public showPassword() {
    this.hide_1 = !this.hide_1;
    this.inputType_1 = this.hide_1 ? 'text' : 'password';
  }

  public showPwdConfirmar() {
    this.hide_2 = !this.hide_2;
    this.inputType_2 = this.hide_2 ? 'text' : 'password';
  }

  public regresar() {
    this.location.back();
  }

  public actualizar() {
    // Lógica para el método PUT (edición)
  }
}
