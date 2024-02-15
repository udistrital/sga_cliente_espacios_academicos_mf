import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-form-espacios-academicos',
  templateUrl: './form-espacios-academicos.component.html',
  styleUrls: ['./form-espacios-academicos.component.scss'],
})
export class FormEspaciosAcademicosComponent implements OnInit {
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
    private popUpManager: PopUpManager
  ) { }

  async ngOnInit() {
    await this.cargarDatosSelect();
  }

  async cargarDatosSelect() {
    try {
      await this.cargarNiveles();
      await this.cargarProyectos();
      //await this.cargarTipos();
      //await this.cargarClases();
      //await this.cargarEnfoques();
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
    const idTipos = 67;
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:${idTipos}&sortby=Nombre&order=asc&limit=0`).subscribe(
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

  onNivelChange(event: any): void {
    this.nivelSeleccionado = event.value;
  }

  onSubNivelChange(event: any): void {
    this.proyectosSelect = []
    this.subNivelSeleccionado = event.value;
    this.proyectos.forEach((proyecto) => {
      if (proyecto.NivelFormacionId && proyecto.NivelFormacionId.Id == event.value) {
        this.proyectosSelect.push(proyecto)
      }
    });
  }

}
