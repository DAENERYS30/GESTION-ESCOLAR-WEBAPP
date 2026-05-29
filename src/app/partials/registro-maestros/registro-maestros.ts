import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { NgxMaskDirective } from "ngx-mask";
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MaestrosService } from '../../services/maestros-service';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-registro-maestros',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    NgxMaskDirective
  ],
  templateUrl: './registro-maestros.html',
  styleUrl: './registro-maestros.scss',
})

export class RegistroMaestros implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};


  public maestro: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public idUser: number = 0;


  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  //Para el select
  public areas: any[] = [
    { value: '1', viewValue: 'Desarrollo Web' },
    { value: '2', viewValue: 'Programación' },
    { value: '3', viewValue: 'Bases de datos' },
    { value: '4', viewValue: 'Redes' },
    { value: '5', viewValue: 'Matemáticas' },
  ];


  public materias: any[] = [
    { value: '1', nombre: 'Aplicaciones Web' },
    { value: '2', nombre: 'Programación 1' },
    { value: '3', nombre: 'Bases de datos' },
    { value: '4', nombre: 'Tecnologías Web' },
    { value: '5', nombre: 'Minería de datos' },
    { value: '6', nombre: 'Desarrollo móvil' },
    { value: '7', nombre: 'Estructuras de datos' },
    { value: '8', nombre: 'Administración de redes' },
    { value: '9', nombre: 'Ingeniería de Software' },
    { value: '10', nombre: 'Administración de S.O.' },
  ];
  // Arreglo para los radio buttons de los campus
  public campuses: any[] = [
    { value: 'CU San Manuel', viewValue: 'CU San Manuel' },
    { value: 'CU2', viewValue: 'CU2' }
  ];

  constructor(
    private location: Location,
    private router: Router,
    private maestrosService: MaestrosService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    //Primero validamos si existe un rol y un id, si es así, estamos en modo edición y cargamos los datos del usuario a editar
    if (this.activatedRoute.snapshot.params['id'] !== undefined) {
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      //Asignamos los datos del usuario que vienen desde la vista principal con el decorador
      this.maestro = this.datos_user;
      /* para convertir el formato de Django (lista de Python) a un arreglo de JS real */
      if (typeof this.maestro.materias_json === 'string') {
        try {
          // 1. Quitamos los corchetes iniciales y finales '[' ']'
          let cleanStr = this.maestro.materias_json.replace(/[\[\]]/g, '');

          // 2. Si la cadena no está vacía, separamos por comas
          if (cleanStr.trim() !== "") {
            // split(',') divide por la coma
            // .map quita las comillas simples o dobles que queden y los espacios extra
            this.maestro.materias_json = cleanStr.split(',').map((m: string) => m.replace(/['"]/g, '').trim());
          } else {
            this.maestro.materias_json = [];
          }
          console.log("Materias limpias después de procesar:", this.maestro.materias_json);
        } catch (e) {
          console.error("Error al limpiar las materias:", e);
          this.maestro.materias_json = [];
        }
      }
    } else {
      // Si no va a editar, entonces inicializamos el JSON para registro nuevo
      this.maestro = this.maestrosService.esquemaMaestro();
      this.maestro.rol = this.rol;
    }
  }

  //Funciones para password
  public showPassword() {
    if (this.inputType_1 === 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar() {
    if (this.inputType_2 === 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = {};

    // Validar datos
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);

    if (Object.keys(this.errors).length > 0) {
      console.log("Errores de validación:", this.errors);
      this.notificationService.error("Revisa los campos obligatorios");
      return;
    }

    // Validar contraseñas
    if (this.maestro.password === this.maestro.confirmar_password) {

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

  public actualizar() {
    // Validación de los datos
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return;
    }
    // Llamamos a la función para actualizar al maestro, esta función se encuentra en el servicio de maestros
    this.maestrosService.actualizarMaestro(this.maestro).subscribe({
      next: (response) => {
        this.notificationService.success("Maestro actualizado exitosamente");
        console.log(response);
        //Si se actualiza correctamente, redirigimos al login
        this.router.navigate(['/maestros']);
      },
      error: (error) => {
        console.error("Error al actualizar maestro: ", error);
        this.notificationService.error("Error al actualizar maestro");
      }
    });
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


  public revisarSeleccion(valor: string): boolean {
  // Verificamos que sea un arreglo y que incluya el nombre de la materia
  if (Array.isArray(this.maestro.materias_json)) {
    return this.maestro.materias_json.includes(valor);
  }
  return false;
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
    const longitudActual = this.maestro.rfc ? this.maestro.rfc.length : 0;

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





}
