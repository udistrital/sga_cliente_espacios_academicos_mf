import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EspaciosAcademicosService } from 'src/app/services/espacios_academicos.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { AgrupacionEspacios } from 'src/app/models/agrupacion_espacios';
import { EspacioAcademico } from 'src/app/models/espacio_academico';
import { EstadoAprobacion, STD } from 'src/app/models/estado_aprobacion';
import { MODALS, ROLES } from 'src/app/models/diccionario';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-form-espacios-academicos',
  templateUrl: './form-espacios-academicos.component.html',
  styleUrls: ['./form-espacios-academicos.component.scss'],
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

  inputBoxColor: string = "white";
  agrupacionFacultadId!: string;
  archivosSoporte: any[] = [];
  accion!: String;
  editar!: boolean;
  visualizar!: boolean;
  camposDisabled: boolean = false;
  modificandoEspacio: boolean = false
  readonly horasCredito: number = 48;
  valorHorasTotal: number = 0;
  mensajeTotalHoras!: String;
  loading: boolean = false;
  IsAdmin!: boolean;
  btnAgrupaciondisabled: boolean = false;

  formStep1!: FormGroup;
  formStep2!: FormGroup;
  formStep3!: FormGroup;

  formProyecto = this.fb.group({
    'nivel': ['', Validators.required],
    'sub_nivel': ['', Validators.required],
    'proyecto_curricular': ['', Validators.required]
  })

  formEspacioAcademico = this.fb.group({
    'nombre': ['', Validators.required],
    'codigo': ['', Validators.required],
    'codigo_abreviacion': ['', Validators.required],
    'plan_estudios': ['', [Validators.required, Validators.min(0)]],
    'tipo': ['', Validators.required],
    'clase': ['', Validators.required],
    'enfoque': ['', Validators.required],
    'creditos': ['', [Validators.required, Validators.min(1)]],
    'espacio_modular': ['', Validators.required],
    'agrupacion_espacios': ['', Validators.required],
    'agrupacion_espacios_color': [''],
    'htd': ['', [Validators.required, Validators.min(0)]],
    'htc': ['', [Validators.required, Validators.min(0)]],
    'hta': ['', [Validators.required, Validators.min(0)]],
    'total': ['', Validators.min(0)],
    'grupos': ['', Validators.required],
    'espacios_requeridos': [''],
  })

  formSoportes = this.fb.group({
    'soporte': ['', Validators.required],
    'aprobado': [''],
    'observaciones': [''],
  })

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private espaciosAcademicosService: EspaciosAcademicosService,
    private gestorDocumentalService: NewNuxeoService,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
    private popUpManager: PopUpManager,
    private activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) { }

  async ngOnInit() {
    this.loading = true;
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

    this.formStep1 = this.formProyecto;
    this.formStep2 = this.formEspacioAcademico;
    this.formStep3 = this.formSoportes;

    await this.cargarDatosSelect();
    this.gestorDocumentalService.clearLocalFiles();

    this.activatedRoute.params.subscribe(params => {
      console.log(params)
      this.accion = params['accion']
      const espacio: any = this.espaciosAcademicos.filter((espacio: any) => espacio._id === params['elemento'])
      if (espacio) {
        this.espacioEdicion = espacio[0]
      }
      console.log(this.accion, params['elemento'], espacio, this.espacioEdicion)
    })

    this.manejoDeAcciones();
    this.loading = false;
  }

  manejoDeAcciones() {
    console.log('Entro MA', this.accion)
    if (this.accion == 'crear') {
      this.modificandoEspacio = true;
    } else if (this.accion == 'editar') {
      console.log('Entro editar')
      this.modificandoEspacio = true;
      this.editar = true;
      this.cargarFormulario(this.espacioEdicion);
    } else if (this.accion == 'visualizar') {
      console.log('Entro ver')
      this.visualizar = true;
      this.cargarFormulario(this.espacioEdicion);
    }

    if (this.visualizar || this.editar) {
      this.camposDisabled = true;
    }
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
      this.popUpManager.showErrorToast("ERROR GENERAL" + error);
    }
  }

  async cargarNiveles(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').subscribe(
        (response: any) => {
          if (Object.keys(response[0]).length > 0) {
            this.niveles = response.filter((nivel: any) => nivel.NivelFormacionPadreId == undefined);
            this.subNivelesPregrado = response.filter((nivel: any) => nivel.NivelFormacionPadreId && nivel.NivelFormacionPadreId.Id == 1);
            this.subNivelesPosgrado = response.filter((nivel: any) => nivel.NivelFormacionPadreId && nivel.NivelFormacionPadreId.Id == 2);
            this.subNiveles = [...this.subNivelesPosgrado, ...this.subNivelesPregrado];
            console.log(this.niveles)
            console.log(this.subNivelesPregrado)
            console.log(this.subNivelesPosgrado)
            console.log(this.subNiveles)
            resolve(true);
          } else {
            reject({ "nivel": null });
          }
        }, (err) => {
          reject({ "nivel": err });
        }
      );
    });
  }

  async cargarProyectos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').subscribe(
        (response: any) => {
          if (Object.keys(response[0]).length > 0) {
            this.proyectos = response
            console.log(this.proyectos)
            resolve(true);
          } else {
            reject({ "proyecto": null });
          }
        }, (err) => {
          reject({ "proyecto": err });
        }
      );
    });
  }

  async cargarTipos(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:67&sortby=Nombre&order=asc&limit=0`).subscribe(
        (response: any) => {
          if (Object.keys(response.Data[0]).length > 0) {
            this.tipos = response.Data
            console.log(this.tipos)
            resolve(true);
          } else {
            reject({ "tipo": null });
          }
        }, (err) => {
          reject({ "tipo": err });
        }
      );
    });
  }

  async cargarClases(): Promise<any> {
    const idClases = 51;
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:${idClases}&sortby=Nombre&order=asc&limit=0`).subscribe(
        (response: any) => {
          if (Object.keys(response.Data[0]).length > 0) {
            this.clases = response.Data
            console.log(this.clases)
            resolve(true);
          } else {
            reject({ "clase": null });
          }
        }, (err) => {
          reject({ "clase": err });
        }
      );
    });
  }

  async cargarEnfoques(): Promise<any> {
    const idEnfoques = 68;
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:${idEnfoques}&sortby=Nombre&order=asc&limit=0`).subscribe(
        (response: any) => {
          if (Object.keys(response.Data[0]).length > 0) {
            this.enfoques = response.Data
            console.log(this.enfoques)
            resolve(true);
          } else {
            reject({ "enfoque": null });
          }
        }, (err) => {
          reject({ "enfoque": err });
        }
      );
    });
  }

  async cargarAgrupacionEspacios(byFacultad?: any): Promise<AgrupacionEspacios[]> {
    console.log(byFacultad)
    let facuId = "";
    if (byFacultad != undefined) {
      facuId = `,facultad_id:${byFacultad}`;
    }
    return new Promise<any>((resolve, reject) => {
      this.espaciosAcademicosService.get('agrupacion-espacios?query=activo:true' + facuId + '&limit=0').subscribe(
        (response: any) => {
          if (Object.keys(response.Data[0]).length > 0) {
            console.log(response.Data)
            resolve(response.Data);
          } else {
            reject({ "agrupacion_espacios": null });
          }
        }, (err) => {
          reject({ "agrupacion_espacios": err });
        }
      )
    });
  }

  async cargarEspaciosAcademicos() {
    return new Promise((resolve, reject) => {
      this.espaciosAcademicosService.get('espacio-academico?query=espacio_academico_padre,activo:true&limit=0').subscribe(
        (response: any) => {
          this.espaciosAcademicos = response["Data"];
          console.log(this.espaciosAcademicos)
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
          this.estadosAprobacion = response["Data"];
          resolve(true);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  obtenerEspaciosRequeridos(event: any): void {
    const espacio: any = this.espaciosAcademicos.filter((espacio: any) => espacio._id == event.value[event.value.length - 1]);
    console.log(this.espaciosAcademicos, espacio, event.value, event.value[event.value.length - 1]);
    if (espacio) {
      this.espaciosRequeridos.push(espacio[0]);
      console.log(this.espaciosRequeridos);
    }
  }

  onNivelChange(event: any): void {
    this.nivelSeleccionado = event.value;
    this.inputBoxColor = "white"
    this.proyectosSelect = []
    this.formProyecto.get('sub_nivel')?.setValue('');
    this.formProyecto.get('proyecto_curricular')?.setValue('');
  }

  onSubNivelChange(event: any): void {
    this.inputBoxColor = "white"
    this.proyectosSelect = []
    this.subNivelSeleccionado = event.value;
    this.formProyecto.get('proyecto_curricular')?.setValue('');
    this.proyectos.forEach((proyecto) => {
      if (proyecto.NivelFormacionId && proyecto.NivelFormacionId.Id == event.value) {
        this.proyectosSelect.push(proyecto)
      }
    });
  }

  onProyectoChange(event: any): void {
    this.inputBoxColor = "white"
    const proyecto: any = this.proyectosSelect.filter((proyecto: any) => proyecto.Id === event.value)
    console.log(proyecto, proyecto[0].FacultadId);
    this.agrupacionFacultadId = proyecto[0].FacultadId
    if (proyecto) {
      this.cargarAgrupacionEspacios(proyecto[0].FacultadId).then((agrupacion_espacios) => {
        this.agrupacionEspacios = agrupacion_espacios;
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  onAgrupacionEspaciosChange(event: any): void {
    const agrupacion: any = this.agrupacionEspacios.filter((agrupacion: any) => agrupacion._id === event.value);
    console.log(agrupacion, agrupacion[0].color_hex);
    this.inputBoxColor = agrupacion[0].color_hex
    this.btnAgrupaciondisabled = true;
  }

  onChangeArchivosSeleccionados(event: any) {
    const archivosSeleccionados: FileList | null = event.target.files;

    if (archivosSeleccionados) {
      for (let i = 0; i < archivosSeleccionados.length; i++) {
        const archivo = archivosSeleccionados[i];
        if (archivo.type === 'application/pdf') {
          this.archivosSoporte.push(archivo);
        } else {
          console.log("Archivo invalido");
        }
      }
      console.log(archivosSeleccionados, archivosSeleccionados[0], this.archivosSoporte);
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
        } else {
          console.log("Archivo invalido");
        }
      }
      console.log(archivosArrastrados, archivosArrastrados[0], this.archivosSoporte);
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

  abrirArchivo(archivo: File) {
    window.open(URL.createObjectURL(archivo), '_blank');
  }

  eliminarArchivo(archivo: File) {
    const index = this.archivosSoporte.indexOf(archivo);
    if (index !== -1) {
      this.archivosSoporte.splice(index, 1);
    }
  }

  formularioCompleto(): boolean {
    const formsValid = this.formProyecto.valid && this.formEspacioAcademico.valid && this.formSoportes.valid;
    console.log(Number(this.formEspacioAcademico.get('total')!.value), Number(this.formEspacioAcademico.get('creditos')!.value) * this.horasCredito, this.valorHorasTotal)
    const totalHoras = (this.valorHorasTotal === Number(this.formEspacioAcademico.get('creditos')!.value) * this.horasCredito);
    let archivosValid = true;
    const archivosErroneos = this.validarArchivos(this.archivosSoporte);
    if (archivosErroneos.length > 0) {
      archivosValid = false;
      console.log('Archivos erróneos:', archivosErroneos);
    }

    return formsValid && totalHoras && archivosValid;
  }

  validarErrorHorasCredito(): boolean {
    let error = false;
    if (this.valorHorasTotal != (Number(this.formEspacioAcademico.get('creditos')!.value) * this.horasCredito)) {
      this.mensajeTotalHoras = "El total de horas debe ser igual a: " + Number(this.formEspacioAcademico.get('creditos')!.value) * this.horasCredito + "h"
      error = true;
    } else {
      this.mensajeTotalHoras = ""
    }
    return error;
  }

  CalcularHorasTotal() {
    this.valorHorasTotal = Number(this.formEspacioAcademico.get('htd')!.value) + Number(this.formEspacioAcademico.get('htc')!.value) + Number(this.formEspacioAcademico.get('hta')!.value)
  }

  validarArchivos(archivos: File[]): string[] {
    const archivosErroneos: string[] = [];
    for (const archivo of archivos) {
      if (!archivo.type.includes('pdf')) {
        archivosErroneos.push(`El archivo ${archivo.name} no es un PDF.`);
      }
      if (archivo.size > 2097152) {
        archivosErroneos.push(`El archivo ${archivo.name} supera el tamaño máximo de 2 MB.`);
      }
    }
    return archivosErroneos;
  }

  prepararArchivos(): any[] {
    const idTipoDocument = 71; // carpeta Nuxeo
    let name = ""
    if (this.archivosSoporte && this.archivosSoporte.length > 0) {
      return this.archivosSoporte.map(archivo => {
        console.log(archivo);
        if (archivo.name) {
          name = archivo.name
        } else {
          name = archivo.nombre
        }
        return {
          IdDocumento: idTipoDocument,
          nombre: name.split('.')[0],
          descripcion: "Soporte Espacio Academico",
          file: archivo
        }
      })
    }
    return [];
  }

  async cargarArchivos(archivos: any[]): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.gestorDocumentalService.uploadFiles(archivos).subscribe(
        (respuesta: any[]) => {
          const listaIds = respuesta.map(f => {
            return f.res.Id;
          });
          resolve(listaIds);
        }
      );
    });
  }

  checkIfAlreadyDownloaded(idArchivos: any[]): Promise<number[]> {
    let notDonwloaded: any[] = []
    return new Promise<number[]>((resolve) => {
      if (idArchivos.length > 0) {
        idArchivos.forEach((id, i) => {
          this.gestorDocumentalService.getByIdLocal(id).subscribe(
            () => {/* Ya está */ },
            () => { notDonwloaded.push(id); }
          );
          if ((i + 1) == idArchivos.length) {
            resolve(notDonwloaded);
          }
        });
      } else {
        resolve(notDonwloaded);
      }
    });
  }

  descargarArchivos(idArchivos: any[]): Promise<any> {
    this.loading = true;
    return new Promise<any>((resolve, reject) => {
      this.checkIfAlreadyDownloaded(idArchivos).then(
        faltantes => {
          const limitQuery = faltantes.length;
          let idsForQuery = "";
          faltantes.forEach((id, i) => {
            idsForQuery += String(id);
            if (i < limitQuery - 1) idsForQuery += '|';
          });
          if (limitQuery > 0) {
            this.gestorDocumentalService.getManyFiles('?query=Id__in:' + idsForQuery + '&limit=' + limitQuery).subscribe(
              r => {
                if (!r.downloadProgress) {
                  this.loading = false;
                  resolve(true);
                }
              }, e => {
                this.loading = false;
                reject(false);
              }
            );
          } else {
            this.loading = false;
            resolve(true)
          }
        });
    });
  }

  postEspacio_Academico(espacio_academico: EspacioAcademico) {
    this.loading = true;
    this.sgaMidService.post('espacios_academicos/espacio_academico_hijos', espacio_academico).subscribe(
      (resp: any) => {
        console.log(resp)
        if (resp.Status == "201") {
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('espacios_academicos.creacion_espacio_ok'));
          this.router.navigate(['/']);
        } else {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.creacion_espacio_fallo'));
        }
      },
      err => {
        this.loading = false;
        this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.creacion_espacio_fallo'));
      }
    );
  }

  putEspacio_Academico(espacio_academico: EspacioAcademico) {
    this.loading = true;
    this.espaciosAcademicosService.put('espacio-academico/'+this.espacioEdicion._id, espacio_academico).subscribe(
      (resp: any) => {
        if (resp.Status == "200") {
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('espacios_academicos.edicion_espacio_ok'));
          this.router.navigate(['/']);
        } else {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.edicion_espacio_fallo'));
        }
      },
      err => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.edicion_espacio_fallo'));
      }
    );
  }

  async prepararCreacion() {
    this.loading = true;
    let newEspacio_Academico = new EspacioAcademico();
    newEspacio_Academico.proyecto_academico_id = (this.formStep1.get('proyecto_curricular')!.value);
    newEspacio_Academico.nombre = this.formStep2.get('nombre')!.value;
    newEspacio_Academico.codigo = this.formStep2.get('codigo')!.value;
    newEspacio_Academico.codigo_abreviacion = this.formStep2.get('codigo_abreviacion')!.value;
    newEspacio_Academico.plan_estudio_id = this.formStep2.get('plan_estudios')!.value;
    newEspacio_Academico.tipo_espacio_id = (this.formStep2.get('tipo')!.value);
    newEspacio_Academico.clasificacion_espacio_id = (this.formStep2.get('clase')!.value);
    newEspacio_Academico.enfoque_id = (this.formStep2.get('enfoque')!.value);
    newEspacio_Academico.creditos = Number(this.formStep2.get('creditos')!.value);
    newEspacio_Academico.espacio_modular = (this.formStep2.get('espacio_modular')!.value);
    newEspacio_Academico.agrupacion_espacios_id = (this.formStep2.get('agrupacion_espacios')!.value);
    newEspacio_Academico.distribucion_horas = {
      HTD: Number(this.formStep2.get('htd')!.value),
      HTC: Number(this.formStep2.get('htc')!.value),
      HTA: Number(this.formStep2.get('hta')!.value)
    };
    newEspacio_Academico.grupo = this.formStep2.get('grupos')!.value;
    newEspacio_Academico.espacios_requeridos = this.formStep2.get('espacios_requeridos')!.value;
    const archivos = this.prepararArchivos();
    newEspacio_Academico.soporte_documental = await this.cargarArchivos(archivos);
    // que no están disponibles para primer instante, y tampoco en rol ASIS_PROYECTO
    const estado = this.estadosAprobacion.find((estado: any) => estado.codigo_abreviacion == STD.IN_EDIT);
    newEspacio_Academico.estado_aprobacion_id = estado!._id;
    newEspacio_Academico.observacion = estado!.nombre;
    // que no se manejan pero requieren
    newEspacio_Academico.inscritos = 0;
    newEspacio_Academico.periodo_id = 0;
    newEspacio_Academico.docente_id = 0;
    newEspacio_Academico.horario_id = "0";
    console.log(newEspacio_Academico);
    this.loading = false;
    this.postEspacio_Academico(newEspacio_Academico);
  }

  async prepararEdicion() {
    this.loading = true;
    let editEspacio_Academico = new EspacioAcademico();
    editEspacio_Academico.proyecto_academico_id = (this.formStep1.get('proyecto_curricular')!.value);
    editEspacio_Academico.nombre = this.formStep2.get('nombre')!.value;
    editEspacio_Academico.codigo = this.formStep2.get('codigo')!.value;
    editEspacio_Academico.codigo_abreviacion = this.formStep2.get('codigo_abreviacion')!.value;
    editEspacio_Academico.plan_estudio_id = this.formStep2.get('plan_estudios')!.value;
    editEspacio_Academico.tipo_espacio_id = (this.formStep2.get('tipo')!.value);
    editEspacio_Academico.clasificacion_espacio_id = (this.formStep2.get('clase')!.value);
    editEspacio_Academico.enfoque_id = (this.formStep2.get('enfoque')!.value);
    editEspacio_Academico.creditos = Number(this.formStep2.get('creditos')!.value);
    editEspacio_Academico.espacio_modular = (this.formStep2.get('espacio_modular')!.value);
    editEspacio_Academico.agrupacion_espacios_id = (this.formStep2.get('agrupacion_espacios')!.value);
    editEspacio_Academico.distribucion_horas = {
      HTD: Number(this.formStep2.get('htd')!.value),
      HTC: Number(this.formStep2.get('htc')!.value),
      HTA: Number(this.formStep2.get('hta')!.value)
    };
    editEspacio_Academico.grupo = this.formStep2.get('grupos')!.value;
    editEspacio_Academico.espacios_requeridos = this.formStep2.get('espacios_requeridos')!.value;
    const archivosNuevos = this.prepararArchivos();
    if (archivosNuevos.length > this.archivosSoporte.length) {
      editEspacio_Academico.soporte_documental = await this.cargarArchivos(archivosNuevos);
    } else {
      editEspacio_Academico.soporte_documental = [];
    }
    if (this.IsAdmin) {
      editEspacio_Academico.estado_aprobacion_id = (this.formStep3.get('aprobado')!.value);
      editEspacio_Academico.observacion = this.formStep3.get('observaciones')!.value;
    } else {
      // Si no es admin no puede cambiar el estado ni poner observación
      editEspacio_Academico.estado_aprobacion_id = this.estadosAprobacion.find(estado => estado.codigo_abreviacion == STD.IN_EDIT)!._id;
      editEspacio_Academico.observacion = this.formStep3.get('observaciones')!.value;
    }
    // que no se manejan pero requieren
    editEspacio_Academico.inscritos = 0;
    editEspacio_Academico.periodo_id = 0;
    editEspacio_Academico.docente_id = 0;
    editEspacio_Academico.horario_id = "0";
    console.log(editEspacio_Academico);
    this.loading = false;
    this.putEspacio_Academico(editEspacio_Academico);
  }

  elegirAccion() {
    if (this.formularioCompleto()) {
      if (this.accion == 'crear') {
        this.popUpManager.showPopUpGeneric(this.translate.instant('espacios_academicos.crear_espacios'),
        this.translate.instant('espacios_academicos.crear_espacios_pregunta'), MODALS.INFO, true).then(
          action => {
            if (action.value) {
              this.prepararCreacion();
            }
          }
        );
      } else if (this.accion == 'editar') {
        this.popUpManager.showPopUpGeneric(
          this.translate.instant('espacios_academicos.editar_espacios'),
          this.translate.instant('espacios_academicos.editar_espacios_pregunta'), MODALS.INFO, true).then(
          action => {
            if (action.value) {
              this.prepararEdicion();
            }
          }
        );
      }
    } else {
      this.formProyecto.markAllAsTouched();
      this.formEspacioAcademico.markAllAsTouched();
      this.formSoportes.markAllAsTouched();
      this.popUpManager.showPopUpGeneric(this.translate.instant('espacios_academicos.espacios_academicos'),
      this.translate.instant('espacios_academicos.formulario_no_completo'), MODALS.INFO, false);
    }
  }

  limpiarFormulario() {
    this.formStep1.reset();
    this.espaciosRequeridos = [];
    this.formStep2.reset();
    this.archivosSoporte = [];
  }

  async cargarFormulario(espacioAcademico: EspacioAcademico) {
    this.loading = true;
    this.limpiarFormulario();
    const proyecto = this.proyectos.find(proyecto => proyecto.Id == espacioAcademico.proyecto_academico_id);
    console.log(proyecto);
    const subnivel = this.subNiveles.find(nivel => nivel.Id == proyecto.NivelFormacionId.Id);
    const nivel = this.niveles.find(nivel => nivel.Id == proyecto.NivelFormacionId.NivelFormacionPadreId.Id);

    this.nivelSeleccionado = nivel.Id;
    this.subNivelSeleccionado = subnivel.Id;
    this.proyectosSelect = [];
    this.proyectos.forEach((proyecto) => {
      if (proyecto.NivelFormacionId && proyecto.NivelFormacionId.Id == subnivel.Id) {
        this.proyectosSelect.push(proyecto)
      }
    });

    console.log(this.proyectosSelect)

    const proyectoSelect: any = this.proyectosSelect.filter((item: any) => item.Id === proyecto.Id)
    if (proyectoSelect) {
      await this.cargarAgrupacionEspacios(proyectoSelect[0].FacultadId).then((agrupacion_espacios) => {
        this.agrupacionEspacios = agrupacion_espacios;
        console.log(this.agrupacionEspacios)
      }).catch((error) => {
        console.log(error);
      })
    }

    const agrupacion: any = this.agrupacionEspacios.filter((agrupacion: any) => agrupacion._id === espacioAcademico.agrupacion_espacios_id);
    console.log(espacioAcademico.espacio_modular, espacioAcademico.espacios_requeridos, agrupacion[0], agrupacion);
    if (agrupacion[0]) {
      this.inputBoxColor = agrupacion[0].color_hex
    }

    this.formStep1.patchValue({
      nivel: nivel.Id,
      sub_nivel: subnivel.Id,
      proyecto_curricular: proyecto.Id
    })

    const horas: any = espacioAcademico.distribucion_horas
    this.btnAgrupaciondisabled = true;

    if (espacioAcademico.espacios_requeridos) {
      for (let i = 0; i < espacioAcademico.espacios_requeridos.length; i++) {
        const espacio: any = this.espaciosAcademicos.filter((espacio: any) => espacio._id == espacioAcademico.espacios_requeridos[i]);

        if (espacio) {
          this.espaciosRequeridos.push(espacio[0]);
          console.log(this.espaciosRequeridos);
        }
      }
    }

    this.formStep2.patchValue({
      nombre: espacioAcademico.nombre,
      codigo: espacioAcademico.codigo,
      codigo_abreviacion: espacioAcademico.codigo_abreviacion,
      plan_estudios: espacioAcademico.plan_estudio_id,
      tipo: this.tipos.find(tipo => tipo.Id == espacioAcademico.tipo_espacio_id).Id,
      clase: this.clases.find(clase => clase.Id == espacioAcademico.clasificacion_espacio_id).Id,
      enfoque: this.enfoques.find(enfoque => enfoque.Id == espacioAcademico.enfoque_id).Id,
      creditos: espacioAcademico.creditos,
      espacio_modular: espacioAcademico.espacio_modular,
      agrupacion_espacios: espacioAcademico.agrupacion_espacios_id,
      htd: horas.HTD,
      htc: horas.HTC,
      hta: horas.HTA,
      total: Number(horas.HTD) + Number(horas.HTC) + Number(horas.HTA),
      grupos: espacioAcademico.grupo,
      espacios_requeridos: espacioAcademico.espacios_requeridos
    })
    this.CalcularHorasTotal();

    console.log(espacioAcademico.soporte_documental, )
    let fillSoporte = '';
    this.descargarArchivos(espacioAcademico.soporte_documental).then(() => {
      espacioAcademico.soporte_documental.forEach((idSoporte: any) => {
        this.gestorDocumentalService.getByIdLocal(idSoporte).subscribe(f => {
          console.log(f, this.archivosSoporte);
          this.archivosSoporte.push(f);
          console.log(f, this.archivosSoporte.length);
          fillSoporte += f.nombre + ', ';
          this.formStep3.patchValue({
            soporte: fillSoporte, // solo para que el campo de formulario no esté vacio y lo valide ok si no se añaden nuevos archivos
          });
        });

      });
    });

    this.formStep3.patchValue({
      aprobado: espacioAcademico.estado_aprobacion_id,
      observaciones: espacioAcademico.observacion
    });
    this.loading = false;
  }
}
