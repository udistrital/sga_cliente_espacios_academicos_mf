import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EspaciosAcademicosService } from 'src/app/services/espacios_academicos.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { AgrupacionEspacios } from 'src/app/models/agrupacion_espacios';
import { EspacioAcademico } from 'src/app/models/espacio_academico';
import { EstadoAprobacion, STD } from 'src/app/models/estado_aprobacion';
import { MODALS, ROLES } from 'src/app/models/diccionario';
import { ActivatedRoute, Router } from '@angular/router';
import { EspacioAcademicoMidService } from 'src/app/services/espacio_academico_mid.service';

@Component({
  selector: 'app-form-espacios-academicos',
  templateUrl: './form-espacios-academicos.component.html',
  styleUrls: ['./form-espacios-academicos.component.scss'],
  standalone: false,
})
export class FormEspaciosAcademicosComponent implements OnInit {
  agrupacionEspacios: AgrupacionEspacios[] = [];
  espaciosAcademicos: EspacioAcademico[] = [];
  espaciosRequeridos: EspacioAcademico[] = [];
  estadosAprobacion!: EstadoAprobacion[];
  niveles!: any[];
  subNivelesPosgrado!: any[];
  subNivelesPregrado!: any[];
  subNiveles!: any[];
  proyectos: any[] = [];
  tipos!: any[];
  clases!: any[];
  enfoques!: any[];
  nivelSeleccionado!: number;
  subNivelSeleccionado!: number;
  proyectosSelect!: any[];
  espacioEdicion!: EspacioAcademico;

  inputBoxColor: string = 'white';
  agrupacionFacultadId!: string;
  archivosSoporte: any[] = [];
  accion!: string;
  editar!: boolean;
  visualizar!: boolean;
  camposDisabled: boolean = false;
  modificandoEspacio: boolean = false;
  readonly horasCredito: number = 48;
  valorHorasTotal: number = 0;
  mensajeTotalHoras!: string;
  IsAdmin!: boolean;
  btnAgrupaciondisabled: boolean = false;

  formStep1!: FormGroup;
  formStep2!: FormGroup;
  formStep3!: FormGroup;

  formProyecto = this.fb.group({
    nivel: ['', Validators.required],
    sub_nivel: ['', Validators.required],
    proyecto_curricular: ['', Validators.required],
  });

  formEspacioAcademico = this.fb.group({
    nombre: ['', Validators.required],
    codigo: ['', Validators.required],
    codigo_abreviacion: ['', Validators.required],
    plan_estudios: ['', [Validators.required, Validators.min(0)]],
    tipo: ['', Validators.required],
    clase: ['', Validators.required],
    enfoque: ['', Validators.required],
    creditos: ['', [Validators.required, Validators.min(1)]],
    espacio_modular: ['', Validators.required],
    agrupacion_espacios: ['', Validators.required],
    agrupacion_espacios_color: [''],
    htd: ['', [Validators.required, Validators.min(0)]],
    htc: ['', [Validators.required, Validators.min(0)]],
    hta: ['', [Validators.required, Validators.min(0)]],
    total: ['', Validators.min(0)],
    grupos: [''],
    espacios_requeridos: [[]],
  });

  formSoportes = this.fb.group({
    soporte: ['', Validators.required],
    aprobado: [''],
    observaciones: [''],
  });

  constructor(
    private readonly translate: TranslateService,
    private readonly fb: FormBuilder,
    private readonly projectService: ProyectoAcademicoService,
    private readonly parametrosService: ParametrosService,
    private readonly espaciosAcademicosService: EspaciosAcademicosService,
    private readonly gestorDocumentalService: NewNuxeoService,
    private readonly espacioAcademicoMidService: EspacioAcademicoMidService,
    private readonly autenticationService: ImplicitAutenticationService,
    private readonly popUpManager: PopUpManager,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) {}

  async ngOnInit() {
    this.autenticationService.getRole().then((rol: any) => {
      const r1 = rol.find((role: string) => role == ROLES.ADMIN_SGA);
      const r2 = rol.find((role: string) => role == ROLES.ASIS_PROYECTO);
      if (r1) {
        this.IsAdmin = true;
      } else if (r2) {
        this.IsAdmin = false;
      }
    });

    this.formStep1 = this.formProyecto;
    this.formStep2 = this.formEspacioAcademico;
    this.formStep3 = this.formSoportes;

    await this.cargarDatosSelect();
    this.gestorDocumentalService.clearLocalFiles();

    this.activatedRoute.params.subscribe((params) => {
      this.accion = params['accion'];
      const espacio: any = this.espaciosAcademicos.filter(
        (espacio: any) => espacio._id === params['elemento'],
      );
      if (espacio) {
        this.espacioEdicion = espacio[0];
      }
    });

    this.manejoDeAcciones();
  }

  manejoDeAcciones() {
    if (this.accion == 'crear') {
      this.modificandoEspacio = true;
    } else if (this.accion == 'editar') {
      this.modificandoEspacio = true;
      this.editar = true;
      this.cargarFormulario(this.espacioEdicion);
    } else if (this.accion == 'visualizar') {
      this.visualizar = true;
      this.cargarFormulario(this.espacioEdicion);
    }

    if (this.visualizar || this.editar) {
      this.camposDisabled = true;
      this.deshabilitarSelectores();
    }

    if (this.visualizar) {
      this.formSoportes.get('aprobado')?.disable();
    }
  }

  private deshabilitarSelectores(): void {
    ['nivel', 'sub_nivel', 'proyecto_curricular'].forEach((control) =>
      this.formProyecto.get(control)?.disable(),
    );
    [
      'tipo',
      'clase',
      'enfoque',
      'espacio_modular',
      'agrupacion_espacios',
      'espacios_requeridos',
    ].forEach((control) => this.formEspacioAcademico.get(control)?.disable());
  }

  async cargarDatosSelect() {
    try {
      await this.cargarNiveles();
      await this.cargarProyectos();
      await this.cargarTipos();
      await this.cargarClases();
      await this.cargarEnfoques();
      await this.cargarEspaciosAcademicos();
      await this.cargarEstadosAprobacion();
    } catch (error) {
      this.popUpManager.showErrorToast('ERROR GENERAL' + error);
    }
  }

  async cargarNiveles(): Promise<any> {
    return new Promise((resolve) => {
      this.projectService
        .get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0')
        .subscribe((response: any) => {
          if (Object.keys(response[0]).length > 0) {
            this.niveles = response.filter(
              (nivel: any) => nivel.NivelFormacionPadreId == undefined,
            );
            this.subNivelesPregrado = response.filter(
              (nivel: any) =>
                nivel.NivelFormacionPadreId &&
                nivel.NivelFormacionPadreId.Id == 1,
            );
            this.subNivelesPosgrado = response.filter(
              (nivel: any) =>
                nivel.NivelFormacionPadreId &&
                nivel.NivelFormacionPadreId.Id == 2,
            );
            this.subNiveles = [
              ...this.subNivelesPosgrado,
              ...this.subNivelesPregrado,
            ];
            resolve(true);
          }
        });
    });
  }

  async cargarProyectos(): Promise<any> {
    return new Promise((resolve) => {
      this.projectService
        .get(
          'proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0',
        )
        .subscribe((response: any) => {
          if (Object.keys(response[0]).length > 0) {
            this.proyectos = response;
            resolve(true);
          }
        });
    });
  }

  async cargarTipos(): Promise<any> {
    return new Promise<any>((resolve) => {
      this.parametrosService
        .get(
          `parametro?query=Activo:true,TipoParametroId:67&sortby=Nombre&order=asc&limit=0`,
        )
        .subscribe((response: any) => {
          if (Object.keys(response.Data[0]).length > 0) {
            this.tipos = response.Data;
            resolve(true);
          }
        });
    });
  }

  async cargarClases(): Promise<any> {
    const idClases = 51;
    return new Promise<any>((resolve) => {
      this.parametrosService
        .get(
          `parametro?query=Activo:true,TipoParametroId:${idClases}&sortby=Nombre&order=asc&limit=0`,
        )
        .subscribe((response: any) => {
          if (Object.keys(response.Data[0]).length > 0) {
            this.clases = response.Data;
            resolve(true);
          }
        });
    });
  }

  async cargarEnfoques(): Promise<any> {
    const idEnfoques = 68;
    return new Promise<any>((resolve) => {
      this.parametrosService
        .get(
          `parametro?query=Activo:true,TipoParametroId:${idEnfoques}&sortby=Nombre&order=asc&limit=0`,
        )
        .subscribe((response: any) => {
          if (Object.keys(response.Data[0]).length > 0) {
            this.enfoques = response.Data;
            resolve(true);
          }
        });
    });
  }

  async cargarAgrupacionEspacios(
    byFacultad?: any,
  ): Promise<AgrupacionEspacios[]> {
    let facuId = '';
    if (byFacultad != undefined) {
      facuId = `,facultad_id:${byFacultad}`;
    }
    return new Promise<any>((resolve) => {
      this.espaciosAcademicosService
        .get('agrupacion-espacios?query=activo:true' + facuId + '&limit=0')
        .subscribe((response: any) => {
          if (Object.keys(response.Data[0]).length > 0) {
            resolve(response.Data);
          }
        });
    });
  }

  async cargarEspaciosAcademicos() {
    return new Promise((resolve) => {
      this.espaciosAcademicosService
        .get(
          'espacio-academico?query=espacio_academico_padre,activo:true&limit=0',
        )
        .subscribe((response: any) => {
          this.espaciosAcademicos = response['Data'];
          resolve(true);
        });
    });
  }

  async cargarEstadosAprobacion() {
    return new Promise((resolve) => {
      this.espaciosAcademicosService
        .get('estado-aprobacion?query=activo:true&limit=0')
        .subscribe((response: any) => {
          this.estadosAprobacion = response['Data'];
          resolve(true);
        });
    });
  }

  obtenerEspaciosRequeridos(event: any): void {
    const idsSeleccionados: string[] = event.value;

    this.espaciosRequeridos = this.espaciosAcademicos.filter((espacio: any) =>
      idsSeleccionados.includes(espacio._id),
    );
  }

  onNivelChange(event: any): void {
    this.nivelSeleccionado = event.value;
    this.inputBoxColor = 'white';
    this.proyectosSelect = [];
    this.formProyecto.get('sub_nivel')?.setValue('');
    this.formProyecto.get('proyecto_curricular')?.setValue('');
  }

  onSubNivelChange(event: any): void {
    this.inputBoxColor = 'white';
    this.proyectosSelect = [];
    this.subNivelSeleccionado = event.value;
    this.formProyecto.get('proyecto_curricular')?.setValue('');
    this.proyectos.forEach((proyecto) => {
      if (
        proyecto.NivelFormacionId &&
        proyecto.NivelFormacionId.Id == event.value
      ) {
        this.proyectosSelect.push(proyecto);
      }
    });
  }

  onProyectoChange(event: any): void {
    this.inputBoxColor = 'white';
    const proyecto: any = this.proyectosSelect.filter(
      (proyecto: any) => proyecto.Id === event.value,
    );
    this.agrupacionFacultadId = proyecto[0].FacultadId;
    if (proyecto) {
      this.cargarAgrupacionEspacios(proyecto[0].FacultadId)
        .then((agrupacion_espacios) => {
          this.agrupacionEspacios = agrupacion_espacios;
        })
        .catch((error) => {});
    }
  }

  onAgrupacionEspaciosChange(event: any): void {
    if (event.value) {
      const agrupacion: any = this.agrupacionEspacios.filter(
        (agrupacion: any) => agrupacion._id === event.value,
      );
      this.inputBoxColor = agrupacion[0].color_hex;
      this.btnAgrupaciondisabled = true;
    } else {
      this.inputBoxColor = 'white';
      this.btnAgrupaciondisabled = false;
    }
  }

  onChangeArchivosSeleccionados(event: any) {
    const archivosSeleccionados: FileList | null = event.target.files;

    if (archivosSeleccionados) {
      let fillArhivos = '';
      for (let i = 0; i < archivosSeleccionados.length; i++) {
        const archivo = archivosSeleccionados[i];
        if (archivo.type === 'application/pdf') {
          this.archivosSoporte.push(archivo);
          fillArhivos += archivo.name + ', ';
        }
      }
      this.formStep3.patchValue({
        soporte: fillArhivos, // solo para que el campo de formulario no esté vacio y lo valide ok si no se añaden nuevos archivos
      });
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    const archivosArrastrados: FileList | undefined = event.dataTransfer?.files;

    if (archivosArrastrados) {
      for (let i = 0; i < archivosArrastrados.length; i++) {
        const archivo = archivosArrastrados[i];
        if (archivo.type === 'application/pdf') {
          this.archivosSoporte.push(archivo);
        }
      }
    }
  }

  validarErrorArchivosSeleccionados(): boolean {
    let error = true;
    if (this.archivosSoporte.length > 0) {
      error = false;
    }
    return error;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  abrirArchivo(archivo: File | { url: string }) {
    let url: string;

    if (archivo instanceof File) {
      // Caso 1: File / Blob
      url = URL.createObjectURL(archivo);
    } else if (archivo?.url) {
      // Caso 2: Ya es una URL blob
      url = archivo.url;
    } else {
      return;
    }

    window.open(url, '_blank');
  }

  eliminarArchivo(archivo: File) {
    const index = this.archivosSoporte.indexOf(archivo);
    if (index !== -1) {
      this.archivosSoporte.splice(index, 1);
    }
  }

  formularioCompleto(): boolean {
    const formsValid =
      this.formularioValido(this.formProyecto) &&
      this.formEspacioAcademico.valid &&
      this.formSoportes.valid;
    const totalHoras =
      this.valorHorasTotal ===
      Number(this.formEspacioAcademico.get('creditos')!.value) *
        this.horasCredito;
    let archivosValid = true;
    const archivosErroneos = this.validarArchivos(this.archivosSoporte);
    if (archivosErroneos.length > 0) {
      archivosValid = false;
    }

    return formsValid && totalHoras && archivosValid;
  }

  private formularioValido(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    }

    return (
      this.editar &&
      form.disabled &&
      Object.values(form.controls).every((control) => {
        const errors = control.validator?.(control);
        return errors === null || errors === undefined;
      })
    );
  }

  validarErrorHorasCredito(): boolean {
    let error = false;
    if (
      this.valorHorasTotal !=
      Number(this.formEspacioAcademico.get('creditos')!.value) *
        this.horasCredito
    ) {
      this.mensajeTotalHoras =
        'El total de horas debe ser igual a: ' +
        Number(this.formEspacioAcademico.get('creditos')!.value) *
          this.horasCredito +
        'h';
      error = true;
    } else {
      this.mensajeTotalHoras = '';
    }
    return error;
  }

  CalcularHorasTotal() {
    this.valorHorasTotal =
      Number(this.formEspacioAcademico.get('htd')!.value) +
      Number(this.formEspacioAcademico.get('htc')!.value) +
      Number(this.formEspacioAcademico.get('hta')!.value);
  }

  validarArchivos(archivos: File[]): string[] {
    const archivosErroneos: string[] = [];
    for (const archivo of archivos) {
      if (!archivo.type.includes('pdf')) {
        archivosErroneos.push(`El archivo ${archivo.name} no es un PDF.`);
      }
      if (archivo.size > 2097152) {
        archivosErroneos.push(
          `El archivo ${archivo.name} supera el tamaño máximo de 2 MB.`,
        );
      }
    }
    return archivosErroneos;
  }

  async prepararArchivos(): Promise<any[]> {
    const idTipoDocument = 71; // carpeta Nuxeo

    if (!this.archivosSoporte || this.archivosSoporte.length === 0) {
      return [];
    }

    return Promise.all(
      this.archivosSoporte.map(async (archivo) => {
        const name = archivo.name ?? archivo.nombre;

        let file: File;

        if (archivo instanceof File) {
          file = archivo;
        } else {
          const response = await fetch(archivo.url);
          const blob = await response.blob();

          file = new File([blob], archivo.nombre, {
            type: blob.type || archivo.type,
          });
        }

        return {
          IdDocumento: idTipoDocument,
          nombre: name.split('.')[0],
          descripcion: 'Soporte Espacio Academico',
          file: file,
        };
      }),
    );
  }

  async cargarArchivos(archivos: any[]): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.gestorDocumentalService
        .uploadFiles(archivos)
        .subscribe((respuesta: any[]) => {
          const listaIds = respuesta.map(
            (f) => {
              return f.res.Id;
            },
            (error: any) => {
              this.popUpManager.showAlert(
                this.translate.instant('GLOBAL.error'),
                this.translate.instant(
                  'espacios_academicos.creacion_espacio_fallo',
                ),
              );
            },
          );

          resolve(listaIds);
        });
    });
  }

  checkIfAlreadyDownloaded(idArchivos: any[]): Promise<number[]> {
    let notDonwloaded: any[] = [];
    return new Promise<number[]>((resolve) => {
      if (idArchivos.length > 0) {
        idArchivos.forEach((id, i) => {
          this.gestorDocumentalService.getByIdLocal(id).subscribe(
            () => {
              /* Ya está */
            },
            () => {
              notDonwloaded.push(id);
            },
          );
          if (i + 1 == idArchivos.length) {
            resolve(notDonwloaded);
          }
        });
      } else {
        resolve(notDonwloaded);
      }
    });
  }

  descargarArchivos(idArchivos: any[]): Promise<any> {
    return new Promise<any>((resolve) => {
      this.checkIfAlreadyDownloaded(idArchivos).then((faltantes) => {
        const limitQuery = faltantes.length;
        let idsForQuery = '';
        faltantes.forEach((id, i) => {
          idsForQuery += String(id);
          if (i < limitQuery - 1) idsForQuery += '|';
        });
        if (limitQuery > 0) {
          this.gestorDocumentalService
            .getManyFiles(
              '?query=Id__in:' + idsForQuery + '&limit=' + limitQuery,
            )
            .subscribe((r) => {
              if (r.downloadProgress === undefined) {
                resolve(true);
              }
            });
        } else {
          resolve(true);
        }
      });
    });
  }

  postEspacio_Academico(espacio_academico: EspacioAcademico) {
    this.espaciosAcademicosService
      .post('espacio-academico', espacio_academico)
      .subscribe(
        (resp: any) => {
          if (resp.Status == '201' || resp.Status == 201) {
            this.popUpManager.showSuccessAlert(
              this.translate.instant('espacios_academicos.creacion_espacio_ok'),
            );
            this.router.navigate(['/']);
          } else {
            this.popUpManager.showErrorAlert(
              this.translate.instant(
                'espacios_academicos.creacion_espacio_fallo',
              ),
            );
          }
        },
        (err) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant(
              'espacios_academicos.creacion_espacio_fallo',
            ),
          );
        },
      );
  }

  putEspacio_Academico(espacio_academico: EspacioAcademico) {
    this.espaciosAcademicosService
      .put('espacio-academico/' + this.espacioEdicion._id, espacio_academico)
      .subscribe(
        (resp: any) => {
          if (resp.Status == '200') {
            this.popUpManager.showSuccessAlert(
              this.translate.instant('espacios_academicos.edicion_espacio_ok'),
            );
            this.router.navigate(['/']);
          } else {
            this.popUpManager.showErrorAlert(
              this.translate.instant(
                'espacios_academicos.edicion_espacio_fallo',
              ),
            );
          }
        },
        (err) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('espacios_academicos.edicion_espacio_fallo'),
          );
        },
      );
  }

  async prepararCreacion() {
    let newEspacio_Academico = new EspacioAcademico();
    newEspacio_Academico.proyecto_academico_id = this.formStep1.get(
      'proyecto_curricular',
    )!.value;
    newEspacio_Academico.nombre = this.formStep2.get('nombre')!.value;
    newEspacio_Academico.codigo = this.formStep2.get('codigo')!.value;
    newEspacio_Academico.codigo_abreviacion =
      this.formStep2.get('codigo_abreviacion')!.value;
    newEspacio_Academico.plan_estudio_id =
      this.formStep2.get('plan_estudios')!.value;
    newEspacio_Academico.tipo_espacio_id = this.formStep2.get('tipo')!.value;
    newEspacio_Academico.clasificacion_espacio_id =
      this.formStep2.get('clase')!.value;
    newEspacio_Academico.enfoque_id = this.formStep2.get('enfoque')!.value;
    newEspacio_Academico.creditos = Number(
      this.formStep2.get('creditos')!.value,
    );
    newEspacio_Academico.espacio_modular =
      this.formStep2.get('espacio_modular')!.value;
    newEspacio_Academico.agrupacion_espacios_id = this.formStep2.get(
      'agrupacion_espacios',
    )!.value;
    newEspacio_Academico.distribucion_horas = {
      HTD: Number(this.formStep2.get('htd')!.value),
      HTC: Number(this.formStep2.get('htc')!.value),
      HTA: Number(this.formStep2.get('hta')!.value),
    };
    newEspacio_Academico.espacios_requeridos = this.formStep2.get(
      'espacios_requeridos',
    )!.value;
    const archivos = await this.prepararArchivos();
    newEspacio_Academico.soporte_documental =
      await this.cargarArchivos(archivos);
    // que no están disponibles para primer instante, y tampoco en rol ASIS_PROYECTO
    const estado = this.estadosAprobacion.find(
      (estado: any) => estado.codigo_abreviacion == STD.IN_EDIT,
    );
    newEspacio_Academico.estado_aprobacion_id = estado!._id;
    newEspacio_Academico.observacion = estado!.nombre;
    // que no se manejan pero requieren
    newEspacio_Academico.inscritos = 0;
    newEspacio_Academico.periodo_id = 0;
    newEspacio_Academico.docente_id = 0;
    newEspacio_Academico.grupo_estudio_id = '0';
    newEspacio_Academico.grupo = 'padre';
    this.postEspacio_Academico(newEspacio_Academico);
  }

  async prepararEdicion() {
    let editEspacio_Academico = new EspacioAcademico();
    editEspacio_Academico.proyecto_academico_id = this.formStep1.get(
      'proyecto_curricular',
    )!.value;
    editEspacio_Academico.nombre = this.formStep2.get('nombre')!.value;
    editEspacio_Academico.codigo = this.formStep2.get('codigo')!.value;
    editEspacio_Academico.codigo_abreviacion =
      this.formStep2.get('codigo_abreviacion')!.value;
    editEspacio_Academico.plan_estudio_id =
      this.formStep2.get('plan_estudios')!.value;
    editEspacio_Academico.tipo_espacio_id = this.formStep2.get('tipo')!.value;
    editEspacio_Academico.clasificacion_espacio_id =
      this.formStep2.get('clase')!.value;
    editEspacio_Academico.enfoque_id = this.formStep2.get('enfoque')!.value;
    editEspacio_Academico.creditos = Number(
      this.formStep2.get('creditos')!.value,
    );
    editEspacio_Academico.espacio_modular =
      this.formStep2.get('espacio_modular')!.value;
    editEspacio_Academico.agrupacion_espacios_id = this.formStep2.get(
      'agrupacion_espacios',
    )!.value;
    editEspacio_Academico.distribucion_horas = {
      HTD: Number(this.formStep2.get('htd')!.value),
      HTC: Number(this.formStep2.get('htc')!.value),
      HTA: Number(this.formStep2.get('hta')!.value),
    };
    editEspacio_Academico.grupo = this.formStep2.get('grupos')!.value;
    editEspacio_Academico.espacios_requeridos = this.formStep2.get(
      'espacios_requeridos',
    )!.value;
    const archivosNuevos = await this.prepararArchivos();
    if (archivosNuevos.length >= this.archivosSoporte.length) {
      editEspacio_Academico.soporte_documental =
        await this.cargarArchivos(archivosNuevos);
    } else {
      editEspacio_Academico.soporte_documental = [];
    }
    if (this.IsAdmin) {
      editEspacio_Academico.estado_aprobacion_id =
        this.formStep3.get('aprobado')!.value;
      editEspacio_Academico.observacion =
        this.formStep3.get('observaciones')!.value;
    } else {
      // Si no es admin no puede cambiar el estado ni poner observación
      editEspacio_Academico.estado_aprobacion_id = this.estadosAprobacion.find(
        (estado) => estado.codigo_abreviacion == STD.IN_EDIT,
      )!._id;
      editEspacio_Academico.observacion =
        this.formStep3.get('observaciones')!.value;
    }
    // que no se manejan pero requieren
    editEspacio_Academico.inscritos = 0;
    editEspacio_Academico.periodo_id = 0;
    editEspacio_Academico.docente_id = 0;
    editEspacio_Academico.grupo_estudio_id = '0';
    this.putEspacio_Academico(editEspacio_Academico);
  }

  elegirAccion() {
    if (this.formularioCompleto()) {
      if (this.accion == 'crear') {
        this.popUpManager
          .showPopUpGeneric(
            this.translate.instant('espacios_academicos.crear_espacios'),
            this.translate.instant(
              'espacios_academicos.crear_espacios_pregunta',
            ),
            MODALS.INFO,
            true,
          )
          .then((action) => {
            if (action.value) {
              this.prepararCreacion();
            }
          });
      } else if (this.accion == 'editar') {
        this.popUpManager
          .showPopUpGeneric(
            this.translate.instant('espacios_academicos.editar_espacios'),
            this.translate.instant(
              'espacios_academicos.editar_espacios_pregunta',
            ),
            MODALS.INFO,
            true,
          )
          .then((action) => {
            if (action.value) {
              this.prepararEdicion();
            }
          });
      }
    } else {
      this.formProyecto.markAllAsTouched();
      this.formEspacioAcademico.markAllAsTouched();
      this.formSoportes.markAllAsTouched();
      this.highlightInvalidFields(); // Llama al método para resaltar campos inválidos
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('espacios_academicos.espacios_academicos'),
        this.translate.instant('espacios_academicos.formulario_no_completo'),
        MODALS.INFO,
        false,
      );
    }
  }

  limpiarFormulario() {
    this.formStep1.reset();
    this.espaciosRequeridos = [];
    this.formStep2.reset();
    this.archivosSoporte = [];
  }

  async cargarFormulario(espacioAcademico: EspacioAcademico) {
    this.limpiarFormulario();
    const contexto = this.obtenerContextoFormulario(espacioAcademico);
    if (!contexto) {
      return;
    }

    await this.cargarAgrupacionesFormulario(
      contexto.proyecto,
      espacioAcademico.agrupacion_espacios_id,
    );

    this.formStep1.patchValue({
      nivel: contexto.nivel.Id,
      sub_nivel: contexto.subnivel.Id,
      proyecto_curricular: contexto.proyecto.Id,
    });

    const espaciosRequeridos = this.cargarEspaciosRequeridos(espacioAcademico);
    this.formStep2.patchValue(
      this.obtenerValoresFormularioEspacio(
        espacioAcademico,
        espaciosRequeridos,
      ),
    );
    this.CalcularHorasTotal();
    this.cargarSoportesDocumentales(espacioAcademico);
    this.formStep3.patchValue({
      aprobado: espacioAcademico.estado_aprobacion_id,
      observaciones: espacioAcademico.observacion,
    });
  }

  private obtenerContextoFormulario(espacioAcademico: EspacioAcademico) {
    const proyecto = this.proyectos.find(
      (proyecto) => proyecto.Id == espacioAcademico.proyecto_academico_id,
    );
    const nivelFormacion = proyecto?.NivelFormacionId;
    if (!nivelFormacion) {
      this.popUpManager.showErrorToast(
        'No se encontró el nivel de formación del proyecto.',
      );
      return null;
    }

    const subnivel =
      this.subNiveles.find((nivel) => nivel.Id == nivelFormacion.Id) ??
      nivelFormacion;
    const nivelId =
      nivelFormacion.NivelFormacionPadreId?.Id ?? nivelFormacion.Id;
    const nivel = this.niveles.find((nivel) => nivel.Id == nivelId);
    if (!nivel) {
      this.popUpManager.showErrorToast(
        'No se encontró el nivel de formación asociado al proyecto.',
      );
      return null;
    }

    this.nivelSeleccionado = nivel.Id;
    this.subNivelSeleccionado = subnivel.Id;
    this.proyectosSelect = this.proyectos.filter(
      (proyecto) =>
        proyecto.NivelFormacionId &&
        proyecto.NivelFormacionId.Id == subnivel.Id,
    );

    return { proyecto, nivel, subnivel };
  }

  private async cargarAgrupacionesFormulario(
    proyecto: any,
    agrupacionId: string,
  ) {
    const proyectoSelect = this.proyectosSelect.find(
      (item: any) => item.Id === proyecto.Id,
    );
    if (proyectoSelect) {
      await this.cargarAgrupacionEspacios(proyectoSelect.FacultadId)
        .then((agrupacion_espacios) => {
          this.agrupacionEspacios = agrupacion_espacios;
        })
        .catch(() => {});
    }

    const agrupacion = this.agrupacionEspacios.find(
      (item: any) => item._id === agrupacionId,
    );
    if (agrupacion) {
      this.inputBoxColor = agrupacion.color_hex;
    }
    this.btnAgrupaciondisabled = true;
  }

  private cargarEspaciosRequeridos(espacioAcademico: EspacioAcademico) {
    const espaciosRequeridos: any[] = Array.isArray(
      espacioAcademico.espacios_requeridos,
    )
      ? espacioAcademico.espacios_requeridos
      : espacioAcademico.espacios_requeridos
        ? [espacioAcademico.espacios_requeridos]
        : [];

    for (const idEspacio of espaciosRequeridos) {
      const espacio = this.espaciosAcademicos.find(
        (item: any) => item._id == idEspacio,
      );
      if (espacio) {
        this.espaciosRequeridos.push(espacio);
      }
    }
    return espaciosRequeridos;
  }

  private obtenerValoresFormularioEspacio(
    espacioAcademico: EspacioAcademico,
    espaciosRequeridos: any[],
  ) {
    const horas: any = espacioAcademico.distribucion_horas;
    return {
      nombre: espacioAcademico.nombre,
      codigo: espacioAcademico.codigo,
      codigo_abreviacion: espacioAcademico.codigo_abreviacion,
      plan_estudios: espacioAcademico.plan_estudio_id,
      tipo:
        this.tipos.find((tipo) => tipo.Id == espacioAcademico.tipo_espacio_id)
          ?.Id ?? espacioAcademico.tipo_espacio_id,
      clase:
        this.clases.find(
          (clase) => clase.Id == espacioAcademico.clasificacion_espacio_id,
        )?.Id ?? espacioAcademico.clasificacion_espacio_id,
      enfoque:
        this.enfoques.find(
          (enfoque) => enfoque.Id == espacioAcademico.enfoque_id,
        )?.Id ?? espacioAcademico.enfoque_id,
      creditos: espacioAcademico.creditos,
      espacio_modular: espacioAcademico.espacio_modular,
      agrupacion_espacios: espacioAcademico.agrupacion_espacios_id,
      htd: horas.HTD,
      htc: horas.HTC,
      hta: horas.HTA,
      total: Number(horas.HTD) + Number(horas.HTC) + Number(horas.HTA),
      grupos: espacioAcademico.grupo,
      espacios_requeridos: espaciosRequeridos,
    };
  }

  private cargarSoportesDocumentales(espacioAcademico: EspacioAcademico) {
    let fillSoporte = '';
    const soportesDocumentalesRaw: any[] = Array.isArray(
      espacioAcademico.soporte_documental,
    )
      ? espacioAcademico.soporte_documental
      : espacioAcademico.soporte_documental
        ? [espacioAcademico.soporte_documental]
        : [];
    const soportesDocumentales: number[] = [];
    for (const soporte of soportesDocumentalesRaw) {
      const idSoporte =
        soporte && typeof soporte === 'object' ? soporte.Id : soporte;
      const idNumerico = Number(idSoporte);
      if (
        idSoporte !== null &&
        idSoporte !== '' &&
        Number.isFinite(idNumerico)
      ) {
        soportesDocumentales.push(idNumerico);
      } else {
        this.popUpManager.showErrorToast(
          'No fue posible identificar un documento de soporte.',
        );
      }
    }

    let errorSoporteNotificado = false;
    const notificarErrorSoporte = () => {
      if (!errorSoporteNotificado) {
        this.popUpManager.showErrorToast(
          'No fue posible recuperar uno o más documentos de soporte.',
        );
        errorSoporteNotificado = true;
      }
    };

    this.descargarArchivos(soportesDocumentales)
      .then(() => {
        soportesDocumentales.forEach((idSoporte: any) => {
          this.gestorDocumentalService
            .getByIdLocal(idSoporte)
            .subscribe((f) => {
              this.archivosSoporte.push(f);
              fillSoporte += f.nombre + ', ';
              this.formStep3.patchValue({
                soporte: fillSoporte, // solo para que el campo de formulario no esté vacio y lo valide ok si no se añaden nuevos archivos
              });
            }, notificarErrorSoporte);
        });
      })
      .catch(notificarErrorSoporte);
  }

  highlightInvalidFields() {
    const controlGroups: FormGroup[] = [
      this.formProyecto,
      this.formEspacioAcademico,
      this.formSoportes,
    ];

    for (const controlGroup of controlGroups) {
      if (this.highlightInvalidControl(controlGroup)) {
        return;
      }
    }
  }

  private highlightInvalidControl(controlGroup: FormGroup): boolean {
    for (const controlKey in controlGroup.controls) {
      if (
        !Object.prototype.hasOwnProperty.call(controlGroup.controls, controlKey)
      ) {
        continue;
      }

      const control = controlGroup.get(controlKey);
      if (!control?.invalid) {
        continue;
      }

      const element = document.querySelector(
        `[formcontrolname="${controlKey}"]`,
      );
      if (!element) {
        continue;
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-error');
      return true;
    }

    return false;
  }
}
