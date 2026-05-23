import { Component, OnInit, ViewChild } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatTableDataSource } from '@angular/material/table';
import { DatosAlumno } from '../../interfaces/usuarios-interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlumnosService } from '../../services/alumnos-service';
import { NotificationService } from '../../services/tools/notification-service';
import { AuthServices } from '../../services/auth-services';
import { MatSort } from '@angular/material/sort'; /* para filtros y ordenamiento */

@Component({
  selector: 'app-alumnos-screen',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './alumnos-screen.html',
  styleUrl: './alumnos-screen.scss',
})

export class AlumnosScreen implements OnInit {

  public name_user: string = '';
  public rol: string = '';
  public lista_alumnos: DatosAlumno[] = [];

  /* declaramos columnas a mostrar en la tabla */
  public displayedColumns: string[] = [
    'matricula',
    'nombre',
    'email',
    'fecha_nacimiento',
    'curp',
    'rfc',
    'edad',
    'telefono',
    'ocupacion',
    'editar',
    'eliminar'
  ];


  dataSource = new MatTableDataSource<DatosAlumno>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthServices,
    private alumnosService: AlumnosService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.authService.getUserCompleteName();
    this.rol = this.authService.getUserGroup();
    this.obtenerAlumnos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public obtenerAlumnos(): void {
    /* llamamos al servidor  */
    this.alumnosService.obtenerListaAlumnos().subscribe({
      next: (response) => {
        console.log("Datos recibidos de Django:", response);
        this.lista_alumnos = response;

        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach((usuario: any) => {
            // apalanamos los datos para que la tabla pueda ordenarlos y filtrarlos por nombre completo
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;

            // permite que la columna 'nombre' se ordene y filtre solita
            usuario.nombre = `${usuario.first_name} ${usuario.last_name}`;
          });
        }


        // Solo asigna los datos al dataSource que ya existe.
        this.dataSource.data = this.lista_alumnos;

        // reconectamos el paginador y el sort después de asignar los datos
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      },
      error: () => {
        this.notificationService.error('No se pudo obtener la lista de alumnos');
      }
    });
  }
  // función que  de buscar/filtrar
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  /* metodo para editar un alumno, se dirige a la pantalla de edición con el id del alumno */
  public goEditar(id: number): void {
    this.router.navigate(['/registro-usuarios', 'alumno', id]);
  }

  /* metodo para eliminar un alumno, se muestra una confirmacion antes de eliminar */
  public delete(id: number): void {

  }


}
