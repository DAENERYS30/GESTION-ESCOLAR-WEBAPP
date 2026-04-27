import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors-service';
import { ValidatorService } from './tools/validator-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthServices } from './auth-services';

@Injectable({
  providedIn: 'root',
})
export class AlumnosService {

  constructor(
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private http: HttpClient,
    private authServices: AuthServices
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authServices.getSessionToken();
    return token
      ? new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  // 1. ESQUEMA: Solo con los campos que sí existen para el Alumno
  public esquemaAlumno(){
    return {
      'rol': 'alumno', // Lo dejamos listo de una vez
      'matricula': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'fecha_nacimiento': '',
      'curp': '',
      'rfc': '',
      'edad': '',
      'telefono': '',
      'ocupacion': ''
    }
  }

  // 2. VALIDACIÓN: Sin campos de maestros
  public validarAlumno(data: any, editar: boolean){
    let error: any = {};

    if(!this.validatorService.required(data["matricula"])){
      error["matricula"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["first_name"])){
      error["first_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["last_name"])){
      error["last_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["email"])){
      error["email"] = this.errorService.required;
    } else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if(!editar){
      if(!this.validatorService.required(data["password"])){
        error["password"] = this.errorService.required;
      }
      if(!this.validatorService.required(data["confirmar_password"])){
        error["confirmar_password"] = this.errorService.required;
      }
    }

    if(!this.validatorService.required(data["fecha_nacimiento"])){
      error["fecha_nacimiento"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["curp"])){
      error["curp"] = this.errorService.required;
    } else if(data["curp"].length !== 18){
      error["curp"] = "La CURP debe tener 18 caracteres";
    }

    if(!this.validatorService.required(data["rfc"])){
      error["rfc"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["edad"])){
      error["edad"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["telefono"])){
      error["telefono"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["ocupacion"])){
      error["ocupacion"] = this.errorService.required;
    }

    return error;
  }

  // 3. PETICIÓN HTTP
  public registrarAlumno(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/alumnos/`, data, { headers: this.getAuthHeaders() });
  }
}
