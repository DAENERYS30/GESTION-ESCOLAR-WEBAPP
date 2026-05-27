import { Component, OnInit, ViewChild } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatTableDataSource } from '@angular/material/table';
import { DatosMaestro } from '../../interfaces/usuarios-interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MaestrosService } from '../../services/maestros-service';
import { NotificationService } from '../../services/tools/notification-service';
import { AuthServices } from '../../services/auth-services';
import { MatSort } from '@angular/material/sort'; /* para filtros */
import { EliminarUserModal } from '../../modals/eliminar-user-modal/eliminar-user-modal';


@Component({
  selector: 'app-maestros-screen',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './maestros-screen.html',
  styleUrl: './maestros-screen.scss',
})
export class MaestrosScreen implements OnInit {

  public name_user: string = '';
  public rol: string = '';
  public lista_maestros: any[] = [];

  //Declaramos las columnas que se mostrarán en la tabla
  public displayedColumns: string[] = [
    'id_trabajador',
    'nombre',
    'email',
    'fecha_nacimiento',
    'telefono',
    'rfc',
    'cubiculo',
    'area_investigacion',
    'materias_json',
    'campus',
    'sueldo',
    'editar',
    'eliminar'
  ];

  dataSource = new MatTableDataSource<DatosMaestro>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; /* para filtros */

  constructor(
    private authService: AuthServices,
    private maestrosService: MaestrosService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.authService.getUserCompleteName();
    this.rol = this.authService.getUserGroup();
    this.obtenerMaestros();
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; /* para filtros */
  }

  //Función para obtener la lista de maestros registrados
  public obtenerMaestros(): void {
    /* llamamos al servidor  */
    this.maestrosService.obtenerListaMaestros().subscribe({
      next: (response) => {

        this.lista_maestros = response;
        if (response.length > 0) {
          response.forEach((usuario: any) => {
            // "Aplanamos" los datos para que el filtro los vea fácil
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;

            // CREA ESTA PROPIEDAD: Para que coincida con matColumnDef="nombre"
            usuario.nombre = `${usuario.first_name} ${usuario.last_name}`;
          });
        }

        // Actualizamos la data del objeto existente
        this.dataSource.data = this.lista_maestros;

        // reconeccion de paginacion y ordenamiento despues de actualizar los datos por si fallann
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      /* si no hay masestros */
      error: () => {
        this.notificationService.error('No se pudo obtener la lista de maestros');
      }
    });
  }

  // Función buscar en la tabla
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  /* metodo para editar un maestro, se dirige a la pantalla de edición con el id del administrador */
  public goEditar(id: number): void {
    this.router.navigate(['/registro-usuarios', 'maestro', id]);
  }

  /* metodo para eliminar un maestro, se muestra una confirmacion antes de eliminar */
  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar al maestro
    const idUserSession = Number(this.authService.getUserId());
    // --------- Pero el parámetro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    if (this.rol === 'administrador' || (this.rol === 'maestro' && idUserSession === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModal,{
        data: { id: idUser, rol: 'maestro' }, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      //Después de cerrar el modal, se actualiza la lista de maestros para reflejar los cambios
      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          this.obtenerMaestros();
        }else{
          this.notificationService.error("Maestro no se ha podido eliminar.");
        }
      });
    }else{
      //Si no cumple la condición, se muestra un mensaje de error
      this.notificationService.error("No tienes permiso para eliminar a este maestro.");
    }

  }

}
