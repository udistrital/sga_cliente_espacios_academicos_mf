import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-espacios-academicos',
  templateUrl: './form-espacios-academicos.component.html',
  styleUrls: ['./form-espacios-academicos.component.scss']
})
export class FormEspaciosAcademicosComponent {

  constructor(private fb:FormBuilder) {}

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

}
