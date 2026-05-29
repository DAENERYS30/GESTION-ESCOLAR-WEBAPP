import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { NgxMaskDirective } from "ngx-mask";
import { ActivatedRoute, Router } from '@angular/router';
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
    public idUser: number = 0;

  // Variables para ocultar/mostrar contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  /* /Para el selector de sexo */
  public sexos: any[] = [
    {value: 'M', viewValue: 'Masculino'},
    {value: 'F', viewValue: 'Femenino'},
    {value: 'O', viewValue: 'Prefiero no decirlo'},
  ];

  constructor(
    private location: Location,
    private router: Router,
    private alumnosService: AlumnosService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    //Primero validamos si existe un rol y un id, si es así, estamos en modo edición y cargamos los datos del usuario a editar
     if(this.activatedRoute.snapshot.params['id'] !== undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      //Asignamos los datos del usuario que vienen desde la vista principal con el decorador
      this.alumno = this.datos_user;
    }else{
      // Si no va a editar, entonces inicializamos el JSON para registro nuevo
      this.alumno = this.alumnosService.esquemaAlumno();
      this.alumno.rol = this.rol;
    }
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

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }
    // Llamamos a la función para actualizar al alumno, esta función se encuentra en el servicio de alumnos
    this.alumnosService.actualizarAlumno(this.alumno).subscribe({
      next: (response) => {
        this.notificationService.success("Alumno actualizado exitosamente");
        console.log(response);
        //Si se actualiza correctamente, redirigimos al login
        this.router.navigate(['/alumnos']);
      },
      error: (error) => {
        console.error("Error al actualizar alumno: ", error);
        this.notificationService.error("Error al actualizar alumno");
      }
    });
  }

  // Función para los campos solo de datos alfabeticos
  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }

  /* funcion para los campos que requiran solo números */
  public soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir estrictamente solo números (del 0 al 9)
    if (!(charCode >= 48 && charCode <= 57)) {
      // Si el usuario teclea una letra, espacio o signo, cancelamos la acción
      event.preventDefault();
    }
  }



  public formatoRFC(event: KeyboardEvent) {
    //  Permitir teclas de control (Borrar, Tabulador, Flechas de navegación)
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab'
    ) {
      return; // Se sale de la función y permite que la tecla haga su trabajo normal
    }

    const charCode = event.key.charCodeAt(0);
    const longitudActual = this.alumno.rfc ? this.alumno.rfc.length : 0;

    const esLetra = (charCode >= 65 && charCode <= 90) ||
                    (charCode >= 97 && charCode <= 122) ||
                    charCode === 38 || charCode === 209 || charCode === 241;

    const esNumero = (charCode >= 48 && charCode <= 57);

    // Primeros 4 caracteres -> SOLO LETRAS
    if (longitudActual < 4) {
      if (!esLetra) {
        event.preventDefault();
      }
    }
    // Siguientes 6 caracteres -> SOLO NÚMEROS
    else if (longitudActual >= 4 && longitudActual < 10) {
      if (!esNumero) {
        event.preventDefault();
      }
    }
    //  Últimos 3 caracteres -> ALFANUMÉRICO
    else if (longitudActual >= 10 && longitudActual < 13) {
      if (!esLetra && !esNumero) {
        event.preventDefault();
      }
    }
    //Si ya llegó a 13 caracteres, bloqueamos que siga escribiendo
    else {
      event.preventDefault();
    }
  }

  // Función para el campo de CURP
  public formatoCURP(event: KeyboardEvent) {
    // 0. PASE VIP: Permitir teclas de control
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      return;
    }

    const charCode = event.key.charCodeAt(0);
    // Asegúrate de que la variable apunte a donde guardas la curp (ej. this.alumno.curp)
    const longitudActual = this.alumno.curp ? this.alumno.curp.length : 0;

    // Solo Letras (incluye la Ñ)
    const esLetra = (charCode >= 65 && charCode <= 90) ||
                    (charCode >= 97 && charCode <= 122) ||
                    charCode === 209 || charCode === 241;

    // Solo Números
    const esNumero = (charCode >= 48 && charCode <= 57);

    // REGLA 1: Primeros 4 caracteres -> SOLO LETRAS
    if (longitudActual < 4) {
      if (!esLetra) event.preventDefault();
    }
    // REGLA 2: Siguientes 6 caracteres (posiciones 4 al 9) -> SOLO NÚMEROS
    else if (longitudActual >= 4 && longitudActual < 10) {
      if (!esNumero) event.preventDefault();
    }
    // REGLA 3: Siguientes 6 caracteres (posiciones 10 al 15) -> SOLO LETRAS
    else if (longitudActual >= 10 && longitudActual < 16) {
      if (!esLetra) event.preventDefault();
    }
    // REGLA 4: Posición 16 (Diferenciador de siglo) -> ALFANUMÉRICO
    else if (longitudActual === 16) {
      if (!esLetra && !esNumero) event.preventDefault();
    }
    // REGLA 5: Posición 17 (Dígito verificador final) -> SOLO NÚMERO
    else if (longitudActual === 17) {
      if (!esNumero) event.preventDefault();
    }
  }
}
