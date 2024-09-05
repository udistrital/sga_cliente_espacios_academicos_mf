import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    private formBuilder: FormBuilder,
    private parametros: Parametros
  ) {}

  ngOnInit() {
    this.cargarPeriodos();
    this.iniciarFormEditarGrupo();
    console.log(this.grupo);
  }

  iniciarFormEditarGrupo() {
    this.formEditarGrupo = this.formBuilder.group({
      indicador: ['', Validators.required],
      periodo: ['', Validators.required],
    });
  }

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res;
    });
  }

  editarGrupoEspacioAcademico() {}
}
