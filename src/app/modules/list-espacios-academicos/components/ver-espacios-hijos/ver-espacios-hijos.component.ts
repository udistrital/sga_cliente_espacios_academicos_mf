import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EspacioAcademicoMidService } from 'src/app/services/espacio_academico_mid.service';
import { selectsFormPeriodo } from './utilidades';
import { Parametros } from 'src/utils/Parametros';

@Component({
  selector: 'app-ver-espacios-hijos',
  templateUrl: './ver-espacios-hijos.component.html',
  styleUrls: ['./ver-espacios-hijos.component.scss'],
})
export class VerEspaciosHijosComponent implements OnInit {
  [key: string]: any; // Permitir el acceso dinámico con string keys

  espacioAcademicoId: string | null = null;
  espacioAcademico: any;
  formPeriodo!: FormGroup;
  selectsFormPeriodo: any;
  periodos: any[] = [];

  banderaInfoEspacio: boolean = false;

  constructor(
    private espaciosAcademicosMid: EspacioAcademicoMidService,
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

    this.espaciosAcademicosMid
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

  volverAListaEspaciosAcademicos() {
    this.router.navigate(['/']);
  }
}
