import { ResourceLoader } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EspaciosAcademicosService } from 'src/app/services/espacios_academicos.service';
import { Parametros } from 'src/utils/Parametros';

@Component({
  selector: 'app-dialogo-editar-espacio',
  templateUrl: './dialogo-editar-espacio.component.html',
  styleUrls: ['./dialogo-editar-espacio.component.scss'],
})
export class DialogoEditarEspacioComponent implements OnInit {
  formEditarGrupo!: FormGroup;
  periodos: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public grupo: any,
    public dialogRef: MatDialogRef<DialogoEditarEspacioComponent>,
    private espacioAcademicoService: EspaciosAcademicosService,
    private formBuilder: FormBuilder,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.cargarPeriodos();
    this.iniciarFormEditarGrupo();
    console.log(this.grupo);
  }

  iniciarFormEditarGrupo() {
    this.formEditarGrupo = this.formBuilder.group({
      indicador: [
        this.grupo.grupo,
        [Validators.required, Validators.min(1), Validators.max(1000)],
      ],
    });
  }

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res;
    });
  }

  preguntarEdicionGrupo() {
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant('espacios_academicos.esta_seguro_editar_grupo')
      )
      .then((confirmado) => {
        if (confirmado.value) {
          this.editarGrupoEspacioAcademico();
        }
      });
  }

  editarGrupoEspacioAcademico() {
    const grupoEditado = this.construirObjetoGrupo();
    const grupoEditadoId = grupoEditado._id;
    this.espacioAcademicoService
      .put(`espacio-academico/${grupoEditadoId}`, grupoEditado)
      .subscribe((res: any) => {
        if (res.Success) {
          this.popUpManager.showSuccessAlert(
            this.translate.instant(
              'espacios_academicos.grupo_editado_exitosamente'
            )
          );
          this.dialogRef.close(true);
        }
      });
  }

  construirObjetoGrupo() {
    const grupo = this.grupo;
    grupo.grupo = String(this.formEditarGrupo.get('indicador')?.value);
    return grupo;
  }
}
