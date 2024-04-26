import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AgrupacionEspacios } from 'src/app/models/agrupacion_espacios';
import { EspaciosAcademicosService } from 'src/app/services/espacios_academicos.service';
import { MatTableDataSource } from '@angular/material/table';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agrupacion-espacios-academicos',
  templateUrl: './agrupacion-espacios-academicos.component.html',
  styleUrls: ['./agrupacion-espacios-academicos.component.scss']
})
export class AgrupacionEspaciosAcademicosComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'descripcion', 'color'];
  agrupacionEspacios: AgrupacionEspacios[] = [];
  facultadId!: string;
  dataSource!: MatTableDataSource<AgrupacionEspacios>;

  formAgrupacion = this.fb.group({
    'nombre': ['', Validators.required],
    'codigo_abreviacion': ['', Validators.required],
    'descripcion': ['', Validators.required],
    'color_hex': ['', Validators.required]
  })
  

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private espaciosAcademicosService: EspaciosAcademicosService,
    private popUpManager: PopUpManager,
    private activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.facultadId = params['facultad_id']
      console.log(this.facultadId, params)
    })

    await this.cargarDatosTabla();
  }

  async cargarDatosTabla() {
    await this.cargarAgrupacionEspacios(this.facultadId).then((agrupacion_espacios) => {
      this.agrupacionEspacios = agrupacion_espacios;
    }).catch((error) => {
      console.log(error);
    })
    console.log(this.agrupacionEspacios)

    this.dataSource = new MatTableDataSource<AgrupacionEspacios>(this.agrupacionEspacios);
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

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  guardarAgrupacion() {
    if (this.formAgrupacion.valid && this.facultadId) {
      let postAgrupacionEspacios = new AgrupacionEspacios();
      postAgrupacionEspacios.nombre = this.formAgrupacion.get('nombre')!.value ?? '';
      postAgrupacionEspacios.codigo_abreviacion = this.formAgrupacion.get('codigo_abreviacion')!.value ?? '';
      postAgrupacionEspacios.descripcion = this.formAgrupacion.get('descripcion')!.value ?? '';
      postAgrupacionEspacios.color_hex = this.formAgrupacion.get('color_hex')!.value ?? '';
      postAgrupacionEspacios.facultad_id = Number(this.facultadId);
      this.espaciosAcademicosService.post('agrupacion-espacios', postAgrupacionEspacios).subscribe((resp: any) => {
        this.formAgrupacion.reset();
        this.agrupacionEspacios.push(resp.Data);
        this.popUpManager.showSuccessAlert(this.translate.instant('espacios_academicos.agregar_agrupacion_ok'))
        this.router.navigate(['/']);
      }, (error) => {
        console.warn(error);
        this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.agregar_agrupacion_fail'))
      });
    } else {
      this.formAgrupacion.markAllAsTouched();
    }
  }
}
