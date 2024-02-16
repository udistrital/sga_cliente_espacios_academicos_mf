import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EspaciosAcademicosService } from 'src/app/services/espacios_academicos.service';
import { AgrupacionEspacios } from 'src/app/models/agrupacion_espacios';
import { EspacioAcademico } from 'src/app/models/espacio_academico';
import { EstadoAprobacion } from 'src/app/models/estado_aprobacion';

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
  proyectos!: any[];
  tipos!: any[];
  clases!: any[];
  enfoques!: any[];
  nivelSeleccionado!: number;
  subNivelSeleccionado!: number;
  proyectosSelect!: any[];
  inputBoxColor: string = "white";
  archivosSoporte: any[] = [];


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
    private fb: FormBuilder,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private espaciosAcademicosService: EspaciosAcademicosService,
    private popUpManager: PopUpManager
  ) { }

  async ngOnInit() {
    await this.cargarDatosSelect();
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
            console.log(this.niveles)
            console.log(this.subNivelesPregrado)
            console.log(this.subNivelesPosgrado)
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
    //const idTipos = 67;
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
  }

  onSubNivelChange(event: any): void {
    this.inputBoxColor = "white"
    this.proyectosSelect = []
    this.subNivelSeleccionado = event.value;
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

  onDragOver(event: DragEvent) {
    event.preventDefault(); 
  }

  abrirArchivo(archivo: File) {
    // Lógica para abrir el archivo, por ejemplo, abrir en una nueva pestaña
    window.open(URL.createObjectURL(archivo), '_blank');
  }
  
  eliminarArchivo(archivo: File) {
    const index = this.archivosSoporte.indexOf(archivo);
    if (index !== -1) {
      this.archivosSoporte.splice(index, 1);
    }
  }

}
