import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EspacioAcademicoMidService } from 'src/app/services/espacio_academico_mid.service';
import { gruposContructorTabla, selectsFormPeriodo } from './utilidades';
import { Parametros } from 'src/utils/Parametros';
import { EspaciosAcademicosService } from 'src/app/services/espacios_academicos.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogoEditarEspacioComponent } from './components/dialogo-editar-espacio/dialogo-editar-espacio.component';

@Component({
  selector: 'app-ver-espacios-hijos',
  templateUrl: './ver-espacios-hijos.component.html',
  styleUrls: ['./ver-espacios-hijos.component.scss'],
})
export class VerEspaciosHijosComponent implements OnInit {
  [key: string]: any; // Permitir el acceso dinámico con string keys

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  espacioAcademicoId: string | null = null;
  espacioAcademico: any;
  gruposContructorTabla: any;
  gruposDeEspacioAcademico: any;
  formPeriodo!: FormGroup;
  selectsFormPeriodo: any;
  periodos: any[] = [];
  tablaColumnas: any;

  banderaInfoEspacio: boolean = false;
  banderaTablaGrupos: boolean = false;

  constructor(
    private espacioAcademicoMid: EspacioAcademicoMidService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerEspacioAcademicoId();
    this.iniciarFormularioPeriodo();
    this.cargarPeriodos();
  }

  obtenerEspacioAcademicoId() {
    this.espacioAcademicoId = this.route.snapshot.paramMap.get(
      'espacio-academico-id'
    );

    this.espacioAcademicoMid
      .get(`espacios-academicos/${this.espacioAcademicoId}`)
      .subscribe(
        (res: any) => {
          if (res.Data == null) {
            this.popUpManager.showErrorAlert(
              this.translate.instant(
                'espacios_academicos.no_exite_espacio_academico'
              )
            );
            this.router.navigate(['/']);
          }
          this.espacioAcademico = res.Data;
          this.banderaInfoEspacio = true;
        },
        (Error) => {
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.500'));
          this.router.navigate(['/']);
        }
      );
  }

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res;
    });
  }

  iniciarFormularioPeriodo() {
    this.formPeriodo = this.fb.group({
      periodo: ['', Validators.required],
    });
    this.selectsFormPeriodo = selectsFormPeriodo;
  }

  obtenerGruposDeEspacioPorPeriodo() {
    this.banderaTablaGrupos = false;
    const espacioAcademicoId = this.espacioAcademicoId;
    const periodoId = this.formPeriodo.get('periodo')?.value.Id;

    this.espacioAcademicoMid
      .get(
        `espacios-academicos/grupos?espacio-academico-id=${espacioAcademicoId}&periodo-id=${periodoId}`
      )
      .subscribe((res: any) => {
        if (!(res.Data.length > 0)) {
          return this.popUpManager.showAlert(
            '',
            this.translate.instant('espacios_academicos.no_grupos_para_periodo')
          );
        }

        this.gruposDeEspacioAcademico = res.Data;
        this.construirTabla();
        this.banderaTablaGrupos = true;
      });
  }

  construirTabla() {
    this.gruposContructorTabla = gruposContructorTabla;
    this.tablaColumnas = this.gruposContructorTabla.map(
      (column: any) => column.columnDef
    );
    //Asigna la info a la tabla
    this.gruposDeEspacioAcademico = new MatTableDataSource(
      this.gruposDeEspacioAcademico
    );
    setTimeout(() => {
      this.gruposDeEspacioAcademico.paginator = this.paginator;
    }, 1);
  }

  volverAListaEspaciosAcademicos() {
    this.router.navigate(['/']);
  }

  abrirDialogoEditarEspacio(grupo: any) {
    const dialogRef = this.dialog.open(DialogoEditarEspacioComponent, {
      width: '50%',
      height: 'auto',
      data: grupo,
    });

    // dialogRef.afterClosed().subscribe((grupoEspacio) => {
    //   if (grupoEspacio && grupoEspacio.creado) {
    //     this.cargarGruposDeEspacioAcademico(
    //       { _id: grupoEspacio.info.espacio_academico_padre },
    //       index
    //     ).subscribe((grupos) => {
    //       this.gruposDeEspacioAcademico[index] = grupos;
    //     });
    //   }
    // });
  }
}
