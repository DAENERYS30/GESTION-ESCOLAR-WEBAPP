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
    this.maestrosService.obtenerListaMaestros().subscribe({
      next: (response) => {
        // 1. Procesar/Aplanar los datos (el forEach que vimos arriba)
        this.lista_maestros = response;
        // ... aquí va tu forEach ...
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

        // 2. ASIGNACIÓN CORRECTA: Actualizamos la data del objeto existente
        this.dataSource.data = this.lista_maestros;

        // 3. RE-VINCULACIÓN: Aseguramos que los componentes reconozcan la nueva data
        // Esto es lo que garantiza que las flechas y el paginador reaccionen
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.notificationService.error('No se pudo obtener la lista de maestros');
      }
    });
  }

  // Función para filtrar los datos de la tabla
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    this.router.navigate(['/registro-usuarios', 'maestro', idUser]);
  }

  public delete(idUser: number) {

  }

}
