import { Injectable } from '@angular/core';
//import { ErrorsService } from './tools/errors.service';
//import { ValidatorService } from './tools/validator.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

//Estas son variables para las cookies
const session_cookie_name = 'gestion-escolar-token';
const user_email_cookie_name = 'gestion-escolar-email';
const user_id_cookie_name = 'gestion-escolar-user_id';
const user_complete_name_cookie_name = 'gestion-escolar-user_complete_name';
const group_name_cookie_name = 'gestion-escolar-group_name';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    //private validatorService: ValidatorService,
    //private errorService: ErrorsService,
  ) {}

  //Cerrar sesión
  public logout(): Observable<any> {
    const token = this.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer '+token});
    return this.http.get<any>(`${environment.url_api}/logout/`, { headers });
  }

  // Funciones para utilizar las cookies en web
  retrieveSignedUser(){
    const token = this.getSessionToken();
    const headers = new HttpHeaders({'Authorization': 'Bearer '+token});
    return this.http.get<any>(`${environment.url_api}/me/`, { headers });
  }

  getCookieValue(key:string){
    return this.cookieService.get(key);
  }

  saveCookieValue(key:string, value:string){
    const secure = environment.url_api.indexOf("https")!==-1;
    this.cookieService.set(key, value, undefined, undefined, undefined, secure, secure?"None":"Lax");
  }

  getSessionToken(){
    return this.cookieService.get(session_cookie_name);
  }

  saveUserData(user_data: any) {
    const secure = environment.url_api.indexOf("https") !== -1;
    // Soporta respuesta plana o anidada en 'user'
    const id = user_data.id || user_data.user?.id;
    const email = user_data.email || user_data.user?.email;
    const first_name = user_data.first_name || user_data.user?.first_name || '';
    const last_name = user_data.last_name || user_data.user?.last_name || '';
    const name = (first_name + " " + last_name).trim();
    this.cookieService.set(user_id_cookie_name, id, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_email_cookie_name, email, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_complete_name_cookie_name, name, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(session_cookie_name, user_data.token, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(group_name_cookie_name, user_data.rol, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
  }

  destroyUser(){
    this.cookieService.deleteAll();
  }

  getUserEmail(){
    return this.cookieService.get(user_email_cookie_name);
  }

  getUserCompleteName(){
    return this.cookieService.get(user_complete_name_cookie_name);
  }

  getUserId(){
    return this.cookieService.get(user_id_cookie_name);
  }

  getUserGroup(){
    return this.cookieService.get(group_name_cookie_name);
  }

  // ---- Role helpers (fuente única de verdad para toda la app) ----

  isAdmin(): boolean {
    return this.getUserGroup() === 'administrador';
  }

  isTeacher(): boolean {
    return this.getUserGroup() === 'maestro';
  }

  isStudent(): boolean {
    return this.getUserGroup() === 'alumno';
  }

  canSeeAdminItems(): boolean {
    return this.isAdmin();
  }

  canSeeTeacherItems(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  canSeeStudentItems(): boolean {
    return this.isAdmin() || this.isTeacher() || this.isStudent();
  }

  canSeeHomeItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  canSeeRegisterItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

}
