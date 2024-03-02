import { Component, ViewChild } from '@angular/core';
import { EspacioAcademico } from 'src/app/models/espacio_academico';
import { EstadoAprobacion, STD } from 'src/app/models/estado_aprobacion';
import { ROLES, ACTIONS, MODALS } from 'src/app/models/diccionario';
import { EspaciosAcademicosService } from 'src/app/services/espacios_academicos.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'list-espacios-academicos',
  templateUrl: './list-espacios-academicos.component.html',
  styleUrls: ['./list-espacios-academicos.component.scss']
})
export class ListEspaciosAcademicosComponent implements OnInit {
  displayedColumns: string[] = ['#', 'nombre', 'codigo', 'estado', 'gestion', 'enviar'];
  espacios_academicos: EspacioAcademico[] = [];
  estados_aprobacion!: EstadoAprobacion[];
  IsAdmin!: boolean;
  loading: boolean = false;
  dataSource!: MatTableDataSource<EspacioAcademico>;
  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(
    private translate: TranslateService,
    private espaciosAcademicosService: EspaciosAcademicosService,
    private popUpManager: PopUpManager,
    private autenticationService: ImplicitAutenticationService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.autenticationService.getRole().then(
      (rol: any) => {
        const r1 = rol.find((role: string) => (role == ROLES.ADMIN_SGA));
        const r2 = rol.find((role: string) => (role == ROLES.ASIS_PROYECTO));
        if (r1) {
          this.IsAdmin = true;
          console.log(r1)
        } else if (r2) {
          this.IsAdmin = false;
          console.log(r2)
        }
      }
    );

    await this.cargarDatosTabla();
  }

  async cargarDatosTabla() {
    this.loading = true;
    try {
      await this.cargarEspaciosAcademicos();
      await this.cargarEstadosAprobacion();
    } catch (error) {
      this.popUpManager.showErrorToast("ERROR GENERAL" + error);
    }

    this.espacios_academicos.forEach(espacio => {
      this.ajustarBotonesSegunEstado(espacio);
    });

    this.dataSource = new MatTableDataSource<EspacioAcademico>(this.espacios_academicos);
    this.dataSource.paginator = this.paginator
    this.loading = false;
  }

  async cargarEspaciosAcademicos() {
    return new Promise((resolve, reject) => {
      this.espaciosAcademicosService.get('espacio-academico?query=espacio_academico_padre,activo:true&limit=0').subscribe(
        (response: any) => {
          this.espacios_academicos = response["Data"];
          resolve(true);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  async cargarEstadosAprobacion() {
    return new Promise((resolve, reject) => {
      this.espaciosAcademicosService.get('estado-aprobacion?query=activo:true&limit=0').subscribe(
        (response: any) => {
          this.estados_aprobacion = response["Data"];
          resolve(true);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  ajustarBotonesSegunEstado(espacio: any) {
    const estado = this.estados_aprobacion.find(estado => estado._id == espacio.estado_aprobacion_id);
    if (estado) {
      espacio['estado'] = estado.nombre;
      if (this.IsAdmin) {
        let accion, tipo;
        if ((estado.codigo_abreviacion == STD.IS_APRV)) {
          accion = ACTIONS.VIEW;
          tipo = 'ver';
        } else {
          accion = ACTIONS.EDIT_PART;
          tipo = 'editar';
        }
        espacio['gestion'] = { value: accion, type: tipo, disabled: false };
        espacio['enviar'] = { value: undefined, type: 'enviar', disabled: true };
      } else {
        let accion, tipo;
        if ((estado.codigo_abreviacion == STD.IN_EDIT) || (estado.codigo_abreviacion == STD.NOT_APRV)) {
          accion = ACTIONS.EDIT;
          tipo = 'editar';
        } else {
          accion = ACTIONS.VIEW;
          tipo = 'ver';
        }
        espacio['gestion'] = { value: accion, type: tipo, disabled: false };
        const siEnviar = (estado.codigo_abreviacion == STD.IN_EDIT)
        espacio['enviar'] = { value: undefined, type: 'enviar', disabled: !siEnviar };
      }
    }
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  enviaraRevision(id: string) {
    const espacio: any = this.espacios_academicos.filter((espacio: any) => espacio._id === id);
    console.log(id, espacio[0]);
    let espacio_edit = espacio[0];

    this.popUpManager.showPopUpGeneric(
      this.translate.instant('espacios_academicos.espacios_academicos'),
      this.translate.instant('espacios_academicos.enviar_revision_pregunta'), MODALS.INFO, true).then(
        action => {
          if (action.value) {
            this.loading = true;
            espacio_edit.estado_aprobacion_id = this.estados_aprobacion.find(estado => estado.codigo_abreviacion == STD.IN_REV)?._id;
            console.log(espacio_edit.estado_aprobacion_id, espacio_edit);
            this.espaciosAcademicosService.put('espacio-academico/' + id, espacio_edit).subscribe(
              (resp: any) => {
                if (resp.Status == "200") {
                  this.loading = false;
                  this.popUpManager.showSuccessAlert(this.translate.instant('espacios_academicos.enviar_revision_ok'));
                  this.recargarEspaciosAcademicos();
                  //this.vista = VIEWS.LIST;
                } else {
                  this.loading = false;
                  this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.enviar_revision_fallo'));
                }
              },
              err => {
                this.loading = false;
                this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.enviar_revision_fallo'));
              }
            );
          }
        }
      );
  }

  async recargarEspaciosAcademicos() {
    this.loading = true;
    try {
      await this.cargarDatosTabla();
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.popUpManager.showPopUpGeneric(this.translate.instant('espacios_academicos.consulta_espacios'),
      this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + this.translate.instant('espacios_academicos.espacios_academicos') + '</b>.',
      MODALS.WARNING, false);
    }
    // this.loadEspaciosAcademicos().then(espacios => {
    //   this.espacios_academicos = espacios;
    //   this.espacios_academicos.forEach(espacio => {
    //     this.ajustarBotonesSegunEstado(espacio);
    //   });
    //   this.dataEspaciosAcademicos.load(this.espacios_academicos);
    //   const idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'espacios_requeridos')
    //   if (idx != -1) {
    //     this.formDef.campos_p2[idx].opciones = this.espacios_academicos;
    //   }
    //   this.loading = false;
    // }).catch(err => {
    //   this.loading = false;
    //   this.popUpManager.showPopUpGeneric(this.translate.instant('espacios_academicos.consulta_espacios'),
    //     this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + this.translate.instant('espacios_academicos.espacios_academicos') + '</b>.',
    //     MODALS.WARNING, false);
    // })
  }

}
