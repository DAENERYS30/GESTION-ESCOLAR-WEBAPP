import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { NgxMaskDirective } from "ngx-mask";
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradoresService } from '../../services/administradores-service';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-registro-admin',
  imports: [
    ...SHARED_IMPORTS,
    NgxMaskDirective
],
  templateUrl: './registro-admin.html',
  styleUrl: './registro-admin.scss',
})
export class RegistroAdmin implements OnInit {

  @Input() rol:string = "";
  @Input() datos_user:any = {};

  public admin: any = {};
  public errors: any = {};
  public editar:boolean = false;
  public idUser: number = 0;

  //Para el selector de categroia
  public categorias: any[] = [
    {value: '1', viewValue: 'Tiempo Completo'},
    {value: '2', viewValue: 'Medio Tiempo'},
    {value: '3', viewValue: 'Hora-Clase'},
  ];

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    private router: Router,
    private administradoresService: AdministradoresService,
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
      this.admin = this.datos_user;
    }else{
      // Si no va a editar, entonces inicializamos el JSON para registro nuevo
      this.admin = this.administradoresService.esquemaAdmin();
      this.admin.rol = this.rol;
    }
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
    // Inicializo el objeto de errores para evitar que se muestren errores anteriores o datos anteriores al momento de registrar un nuevo admin
    this.errors = {};
    console.log("Datos del admin: ", this.admin);

    // Validar datos y mostrar errores
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    //Verificamos si el objeto de errores está vacío, lo que indica que no hay errores de validación
    if(Object.keys(this.errors).length > 0){
      return;
    }

    // Validar si las contraseñas coinciden solo si no se está editando, ya que en la edición no es obligatorio cambiar la contraseña
    if(this.admin.password === this.admin.confirmar_password){
      // Si no hay errores de validación, procedemos a registrar al admin
      this.administradoresService.registrarAdmin(this.admin).subscribe({
        next: (response) => {
          this.notificationService.success("Administrador registrado exitosamente");
          console.log(response);
          //Si se registra correctamente, redirigimos al login
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error("Error al registrar administrador: ", error);
          this.notificationService.error("Error al registrar administrador");
        }
      });
    }else{
      this.notificationService.error("Las contraseñas no coinciden");
      this.admin.password="";
      this.admin.confirmar_password="";
    }



  }

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }
    // Llamamos a la función para actualizar al administrador, esta función se encuentra en el servicio de administradores
    this.administradoresService.actualizarAdmin(this.admin).subscribe({
      next: (response) => {
        this.notificationService.success("Administrador actualizado exitosamente");
        console.log(response);
        //Si se actualiza correctamente, redirigimos al login
        this.router.navigate(['/administrador']);
      },
      error: (error) => {
        console.error("Error al actualizar administrador: ", error);
        this.notificationService.error("Error al actualizar administrador");
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



  public fromatoRFC(event: KeyboardEvent) {
    //  Permitir teclas de control (Borrar, Tabulador, Flechas de navegación)
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab'
    ) {
      return; // Se sale de la función y permite que la tecla haga su trabajo normal
    }

    const charCode = event.key.charCodeAt(0);
    const longitudActual = this.admin.rfc ? this.admin.rfc.length : 0;

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
